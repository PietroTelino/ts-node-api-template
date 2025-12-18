export function validatePasswordOrThrow(password: string): void {
    if (typeof password !== 'string') {
        throw new Error('A senha deve ser um texto.');
    }

    if (password.length < 8) {
        throw new Error('A senha deve ter no mínimo 8 caracteres.');
    }

    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    if (!hasSpecialChar) {
        throw new Error('A senha deve conter pelo menos 1 caractere especial.');
    }
}