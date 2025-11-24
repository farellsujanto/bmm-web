import { decodeJwt } from '@src/utils/security/security.util';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useJwtCheckHook = () => {
    const router = useRouter();

    useEffect(() => {
        if (router) {
            // Check if user is already authenticated
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
                const jwtData = decodeJwt(authToken);
                switch (jwtData.xsx) {
                    case 0:
                        router.push('/auth/otp');
                        break;
                    case 1:
                        router.push('/auth/pin');
                        break;
                    case 2:
                        router.push('/dashboard');
                        break;
                }
            }
        }
    }, [router]);
}
