interface DecodedToken {
    email: string
    exp: number
    iat: number
    role: "USER" | "ADMIN"
    userId: string
}

interface Address {
    number: string
    street: string
    city: string
    postal_code: string
    country: string
    latitude: number
    longitude: number
}
