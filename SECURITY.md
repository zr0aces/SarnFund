# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in SarnFund, please report it by emailing the repository maintainers. Please do not create public GitHub issues for security vulnerabilities.

## Known Security Considerations

### Development Dependencies

**Status**: Active monitoring required

The frontend has a moderate severity vulnerability in development dependencies:

- **Package**: `esbuild` (via `vite`)
- **Issue**: GHSA-67mh-4wv8-2f99 - Development server can accept requests from any origin
- **Severity**: Moderate (CVSS 5.3)
- **Impact**: Only affects development server, not production builds
- **Mitigation**: 
  - Use production builds (`npm run build`) for deployment
  - Run development server on localhost only
  - Don't expose dev server to untrusted networks
  - Consider upgrading to Vite 7+ (requires testing for breaking changes)

**Action**: Monitor for updates and upgrade when a stable migration path is available.

### API Security

#### Unauthenticated Endpoints

**Current State**: The `/api/scrape` endpoint is publicly accessible without authentication.

**Risk**: 
- Low to Medium - Can trigger resource-intensive scraping operations
- Potential for abuse if endpoint is exposed publicly

**Mitigation**:
1. **For Production**: Add authentication/authorization
   ```javascript
   // Example using API key
   app.post('/api/scrape', authenticateApiKey, async (req, res) => {
     // ... scraping logic
   });
   ```

2. **Firewall Rules**: Restrict access to backend API
   - Only allow frontend server to access backend
   - Use network segmentation in Docker/cloud deployments

3. **Rate Limiting**: Add rate limiting middleware
   ```javascript
   // Using express-rate-limit
   import rateLimit from 'express-rate-limit';
   
   const scrapeLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // limit each IP to 5 requests per windowMs
   });
   
   app.post('/api/scrape', scrapeLimiter, async (req, res) => {
     // ... scraping logic
   });
   ```

#### CORS Configuration

**Current State**: CORS is enabled for all origins (`app.use(cors())`).

**Risk**: Low - API only serves public fund data

**Recommendation**: Configure CORS for production
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Data Security

#### API Keys and Secrets

**Status**: Good - No secrets committed to repository

**Best Practices**:
- Never commit `.env` files
- Use environment variables for sensitive data
- SEC API keys should be stored in `.env` (already gitignored)
- Rotate API keys periodically

#### Data Privacy

**Current State**: System only stores public fund performance data

**Considerations**:
- No personal user data is collected or stored
- No authentication system (no user credentials)
- Fund data is publicly available information
- Cache files don't contain sensitive information

### Network Security

#### External API Access

**Current State**: Backend fetches data from:
1. Settrade public API (via curl)
2. SEC OpenAPI (optional, via Python client)

**Considerations**:
- Settrade API uses cookies that may contain session information
- Cookies in `refetch_funds_v2.sh` should be kept private
- SEC API keys are sensitive and must be protected

**Recommendations**:
1. Use environment variables for cookies if possible
2. Implement certificate pinning for API calls
3. Validate API responses before processing
4. Log failed requests for monitoring

#### SSL/TLS

**For Production**:
- Use HTTPS for all traffic
- Configure SSL/TLS certificates (Let's Encrypt recommended)
- Force HTTPS redirects in nginx configuration
- Use HSTS headers

### Docker Security

**Current Configuration**: Uses standard Node.js and nginx images

**Recommendations**:

1. **Use Specific Image Tags**:
   ```dockerfile
   # Instead of "latest"
   FROM node:18-alpine3.18
   ```

2. **Run as Non-Root User**:
   ```dockerfile
   USER node
   ```

3. **Scan Images Regularly**:
   ```bash
   docker scan sarnfund-backend
   docker scan sarnfund-frontend
   ```

4. **Limit Container Resources**:
   ```yaml
   # In docker-compose.yml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

### Input Validation

**Current State**: Limited input validation

**API Endpoints**:
- GET endpoints don't accept user input
- POST /api/scrape doesn't accept parameters

**Recommendation**: Add validation for any future endpoints that accept user input

### Dependency Management

#### npm Audit

Run regular security audits:
```bash
cd frontend && npm audit
cd backend && npm audit
```

**Current Status**:
- Frontend: 2 moderate vulnerabilities (dev dependencies only)
- Backend: 0 vulnerabilities

**Process**:
1. Run `npm audit` weekly
2. Review vulnerabilities
3. Update dependencies: `npm update`
4. For major updates: `npm audit fix`
5. Test thoroughly after updates

#### Automated Scanning

**Recommended Tools**:
- GitHub Dependabot (for automated PR)
- Snyk (for comprehensive scanning)
- npm audit (built-in)

### Code Security

#### Best Practices Followed

✅ No eval() or Function() usage
✅ No command injection vulnerabilities
✅ No SQL injection (no database)
✅ No XSS vulnerabilities (React escapes by default)
✅ No secrets in source code
✅ ES modules (import/export) used consistently
✅ Error messages don't expose sensitive info

#### Areas to Monitor

- External API responses (validate before processing)
- Shell script execution (only internal scripts)
- File system operations (limited to data directory)

### Monitoring and Logging

**Current State**: Basic console logging

**Recommendations**:

1. **Structured Logging**:
   ```javascript
   // Use winston or pino
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Security Event Monitoring**:
   - Failed API calls
   - Unusual request patterns
   - Scraper failures
   - Cache corruption

3. **Alerting**:
   - Set up alerts for repeated failures
   - Monitor for unusual activity patterns
   - Track API rate limits

### Production Deployment Checklist

Before deploying to production:

- [ ] Configure CORS for production domain
- [ ] Add authentication to /api/scrape endpoint
- [ ] Enable HTTPS with valid certificates
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Use environment variables for all configuration
- [ ] Run npm audit and address issues
- [ ] Scan Docker images
- [ ] Set up monitoring and logging
- [ ] Configure automatic security updates
- [ ] Document incident response procedures
- [ ] Set up regular backups (if needed)
- [ ] Test error handling and graceful degradation

### Regular Maintenance

**Monthly**:
- Review npm audit results
- Update dependencies
- Review logs for security issues
- Check for new security advisories

**Quarterly**:
- Full security review
- Penetration testing (if applicable)
- Update security documentation
- Review and update access controls

**Annually**:
- Comprehensive security audit
- Update security policies
- Train team on security best practices
- Review and update incident response plan

## Security Contacts

For security concerns or questions, please contact the repository maintainers.

---

**Last Updated**: 2025-12-17
**Version**: 1.0
