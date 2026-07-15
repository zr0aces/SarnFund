import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import config from './config.js';

export class FileFundStoreAdapter {
  constructor() {
    this.dataDir = config.storage.dataDir;
    this.cacheDuration = config.storage.cacheDurationMs;
    this.registryTtl = config.storage.registryTtlMs;
    this.progressTtl = config.storage.progressTtlMs;
    
    this.registryPath = path.join(this.dataDir, 'fund-registry.json');
    this.progressPath = path.join(this.dataDir, '.registry-progress.json');
    this.failedFundsPath = path.join(this.dataDir, 'failed-funds.json');
    this.allFundsPath = path.join(this.dataDir, 'all.json');
  }

  async ensureDataDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  isCacheValid(timestamp, ttl = this.cacheDuration) {
    if (!timestamp) return false;
    return (Date.now() - timestamp) < ttl;
  }

  async getFunds(type, forceFresh = false) {
    try {
      const filePath = path.join(this.dataDir, `${type.toLowerCase()}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      const valid = this.isCacheValid(parsed.timestamp);
      
      if (valid || !forceFresh) {
        return {
          success: true,
          valid,
          timestamp: parsed.timestamp,
          lastUpdated: parsed.lastUpdated,
          selectedAMCs: parsed.selectedAMCs,
          data: parsed.data
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async saveFunds(type, data, additional = {}) {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, `${type.toLowerCase()}.json`);
    const timestamp = Date.now();
    const lastUpdated = new Date(timestamp).toISOString();
    const payload = {
      timestamp,
      lastUpdated,
      data,
      ...additional
    };
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
    return payload;
  }

  async getRegistry() {
    try {
      const data = JSON.parse(await fs.readFile(this.registryPath, 'utf8'));
      if (this.isCacheValid(data.timestamp, this.registryTtl)) {
        // Normalize legacy TESG -> ESG
        const funds = (data.funds || []).map((f) => f.type === 'TESG' ? { ...f, type: 'ESG' } : f);
        return funds;
      }
    } catch (error) {
      // Registry not found or expired
    }
    return null;
  }

  async saveRegistry(funds) {
    await this.ensureDataDir();
    await fs.writeFile(this.registryPath, JSON.stringify({ timestamp: Date.now(), funds }, null, 2));
  }

  async clearRegistry() {
    await fs.rm(this.registryPath, { force: true });
    await this.clearProgress();
  }

  async getProgress() {
    try {
      const data = JSON.parse(await fs.readFile(this.progressPath, 'utf8'));
      if (this.isCacheValid(data.timestamp, this.progressTtl)) {
        return data;
      }
    } catch (error) {
      // No progress checkpoint
    }
    return null;
  }

  async saveProgress(partialRegistry, pendingProfiles) {
    await this.ensureDataDir();
    await fs.writeFile(
      this.progressPath,
      JSON.stringify({ timestamp: Date.now(), partialRegistry, pendingProfiles }, null, 2)
    );
  }

  async clearProgress() {
    try {
      await fs.unlink(this.progressPath);
    } catch (error) {
      // Already gone
    }
  }

  async saveFailedFunds(failedCount, failures) {
    await this.ensureDataDir();
    const timestamp = Date.now();
    const lastUpdated = new Date(timestamp).toISOString();
    await fs.writeFile(
      this.failedFundsPath,
      JSON.stringify({ timestamp, lastUpdated, failedCount, failures }, null, 2)
    );
  }

  async saveAllFundsCombined(resultPayload) {
    await this.ensureDataDir();
    await fs.writeFile(this.allFundsPath, JSON.stringify(resultPayload, null, 2));
  }

  async getHealth() {
    const types = ['rmf', 'esg', 'esgx', 'ssf', 'etf'];
    const cacheResults = await Promise.all(types.map(t => this.getFunds(t)));
    
    let registry = null;
    try {
      if (existsSync(this.registryPath)) {
        const reg = JSON.parse(await fs.readFile(this.registryPath, 'utf8'));
        registry = {
          funds: reg.funds?.length ?? 0,
          lastBuilt: new Date(reg.timestamp).toISOString()
        };
      }
    } catch (e) {
      // Ignored
    }

    let failedFundsCount = 0;
    try {
      if (existsSync(this.failedFundsPath)) {
        const failedData = JSON.parse(await fs.readFile(this.failedFundsPath, 'utf8'));
        failedFundsCount = failedData.failedCount || 0;
      }
    } catch (e) {
      // Ignored
    }

    const cacheInfo = (c) => c
      ? { valid: c.valid, funds: c.data?.length ?? 0, lastUpdated: c.lastUpdated }
      : { valid: false };

    const cache = {};
    types.forEach((t, index) => {
      cache[t] = cacheInfo(cacheResults[index]);
    });

    return {
      status: 'ok',
      secApi: {
        factsheetKey: !!config.sec.factsheetKey,
        factsheetKey2: !!config.sec.factsheetKey2,
        dailyInfoKey: !!config.sec.dailyInfoKey,
        dailyInfoKey2: !!config.sec.dailyInfoKey2,
      },
      registry,
      failedFundsCount,
      cache
    };
  }

  async getStats() {
    const types = ['rmf', 'esg', 'esgx', 'ssf', 'etf'];
    const cacheResults = await Promise.all(types.map(t => this.getFunds(t)));

    let failures = [];
    try {
      if (existsSync(this.failedFundsPath)) {
        const failedData = JSON.parse(await fs.readFile(this.failedFundsPath, 'utf8'));
        failures = failedData.failures || [];
      }
    } catch (e) {
      // Ignored
    }

    const stats = {};
    types.forEach((t, index) => {
      stats[t] = cacheResults[index]?.data?.length || 0;
    });

    return {
      success: true,
      stats,
      failures
    };
  }
}
