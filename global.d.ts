interface DecodedToken {
    email: string
    exp: number
    iat: number
    role: "USER" | "ADMIN"
    userId: string
}
