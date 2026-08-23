// Guards against `undefined`, `null`, `NaN`, and non-numeric fund fields
// coming back from the SEC API (raw "-" values land here after numVal parsing).
export const isValidNumber = (v) => typeof v === 'number' && !isNaN(v);
