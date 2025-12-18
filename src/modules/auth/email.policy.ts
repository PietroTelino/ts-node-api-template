export function validateEmailOrThrow(email: string): void {
    if (typeof email !== 'string') {
        throw new Error('O e-mail deve ser um texto.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        throw new Error('O e-mail é obrigatório.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        throw new Error('O formato do e-mail é inválido.');
    }
}