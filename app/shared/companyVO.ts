export interface CompanyVO {
    id: string,
    company: string,
    logo: string,
    primary: string,
    secondary: string,
    email: string,
    website: string,
    phone: string,
    description: string,
    password: string,
    street: string,
    city: string,
    state: string,
    zip: string,
    issues: Array<string>,
    locations: Array<string>
}