import { CADMIMETypes, endpoints } from '$lib/endpoints'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { Models } from '@kittycad/lib/types'
import { AUTH_COOKIE_NAME } from '$lib/cookies'
import { env } from '$lib/env'

export type ConvertResponse = Models['FileConversion_type'] & {
	statusCode: number
}

export const POST: RequestHandler = async ({ cookies, fetch, request, params }) => {
	const token = env.PROD ? cookies.get(AUTH_COOKIE_NAME) : env.VITE_API_TOKEN
	if (!token) throw error(401, 'You must be logged in to use this API.')

	const body = await request.text()

	if (!body) throw error(422, 'Please include the model as your fetch request body.')
	if (!params.output_format) throw error(422, 'Please include the output format in the URL.')
	if (!Object.keys(CADMIMETypes).some((mimeType) => params.output_format === mimeType)) {
		throw error(422, 'Invalid output format.')
	}

	const response = await fetch(
		endpoints.convert(params.output_format as Models['FileExportFormat_type']),
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/octect-stream',
				Authorization: `Bearer ${token}`
			},
			body
		}
	)

	const data = (await response.json()) as Models['FileConversion_type']

	return json({
		statusCode: response.status,
		...data
	} satisfies ConvertResponse)
}
