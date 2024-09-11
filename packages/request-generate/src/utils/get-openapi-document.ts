import swaggerParse from '@apidevtools/swagger-parser'

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fall back
 * on parsing the file as JSON.
 * @param input Path or url
 */
export async function getOpenApiDocument(input: string) {
  return await swaggerParse.parse(input)
}
