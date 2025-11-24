export interface JwtData {
    id: number,
    role: string,
    xsx: number, // 0 = not yet OTP cleared, 1 = OTP cleared, 2 PIN cleared
    did: string, // device id + EXTRA_SALT
};
