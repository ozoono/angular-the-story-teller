// Fields consumed from the ipapi response; additional provider fields are ignored.
export interface IpApiLocationResponse {
	latitude: number
	longitude: number
	timezone: string
}
