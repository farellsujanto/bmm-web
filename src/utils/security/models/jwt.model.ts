export interface JwtData {
    id: number,
    role: string,
    did: string, // device id + EXTRA_SALT
};
