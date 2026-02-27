import type { QueryStringifyOptions } from '../src/utils/query-string'
import { stringify } from '../src/utils/query-string'

describe('query-string', () => {
  describe('stringify', () => {
    it('should handle empty object', () => {
      expect(stringify({})).toBe('')
      expect(stringify({} as any, { addQueryPrefix: true })).toBe('?')
    })

    it('should handle null and undefined input', () => {
      expect(stringify(null as any)).toBe('')
      expect(stringify(undefined as any)).toBe('')
      expect(stringify(null as any, { addQueryPrefix: true })).toBe('?')
    })

    it('should handle non-object input', () => {
      expect(stringify('string' as any)).toBe('')
      expect(stringify(123 as any)).toBe('')
      expect(stringify(true as any)).toBe('')
    })

    describe('basic key-value pairs', () => {
      it('should stringify simple objects', () => {
        expect(stringify({ foo: 'bar' })).toBe('foo=bar')
        expect(stringify({ name: 'John', age: 30 })).toBe('name=John&age=30')
      })

      it('should handle special characters', () => {
        expect(stringify({ 'name with spaces': 'value with spaces' }))
          .toBe('name%20with%20spaces=value%20with%20spaces')
        expect(stringify({ 'test+plus': 'test&space' }))
          .toBe('test%2Bplus=test%26space')
      })
    })

    describe('null and undefined values', () => {
      it('should skip null and undefined values by default', () => {
        expect(stringify({ a: 'value', b: null, c: undefined, d: 'value2' }))
          .toBe('a=value&d=value2')
      })

      it('should include null values when skipNulls is false', () => {
        expect(stringify({ a: 'value', b: null, c: undefined }, { skipNulls: false }))
          .toBe('a=value&b=&c=')
      })
    })

    describe('array formats', () => {
      it('should handle indices format (default)', () => {
        expect(stringify({ arr: ['a', 'b', 'c'] }))
          .toBe('arr[0]=a&arr[1]=b&arr[2]=c')
        expect(stringify({ arr: ['a', 'b', 'c'] }, { arrayFormat: 'indices' }))
          .toBe('arr[0]=a&arr[1]=b&arr[2]=c')
      })

      it('should handle brackets format', () => {
        expect(stringify({ arr: ['a', 'b', 'c'] }, { arrayFormat: 'brackets' }))
          .toBe('arr[]=a&arr[]=b&arr[]=c')
      })

      it('should handle indices format', () => {
        expect(stringify({ arr: ['a', 'b', 'c'] }, { arrayFormat: 'indices' }))
          .toBe('arr[0]=a&arr[1]=b&arr[2]=c')
      })

      it('should handle comma format', () => {
        expect(stringify({ arr: ['a', 'b', 'c'] }, { arrayFormat: 'comma' }))
          .toBe('arr=a%2Cb%2Cc')
        expect(stringify({ numbers: [1, 2, 3] }, { arrayFormat: 'comma' }))
          .toBe('numbers=1%2C2%2C3')
      })

      it('should handle none format', () => {
        expect(stringify({ arr: ['a', 'b', 'c'] }, { arrayFormat: 'none' }))
          .toBe('arr=a&arr=b&arr=c')
      })

      it('should handle arrays with null and undefined values in comma format', () => {
        expect(stringify({ arr: ['a', null, 'c', undefined, 'd'] }, { arrayFormat: 'comma' }))
          .toBe('arr=a%2Cc%2Cd')
      })
    })

    describe('nested objects', () => {
      it('should handle nested objects with allowDots', () => {
        const obj = {
          user: {
            name: 'John',
            address: {
              city: 'New York',
              country: 'USA',
            },
          },
        }
        expect(stringify(obj))
          .toBe('user.name=John&user.address.city=New%20York&user.address.country=USA')
      })

      it('should handle nested objects without allowDots', () => {
        const obj = {
          user: {
            name: 'John',
            address: {
              city: 'New York',
            },
          },
        }
        expect(stringify(obj, { allowDots: false }))
          .toBe('user%5Bname%5D=John&user%5Baddress%5D%5Bcity%5D=New%20York')
      })

      it('should handle arrays in nested objects', () => {
        const obj = {
          data: {
            tags: ['javascript', 'nodejs'],
            meta: {
              keywords: ['web', 'api'],
            },
          },
        }
        expect(stringify(obj))
          .toBe('data.tags[0]=javascript&data.tags[1]=nodejs&data.meta.keywords[0]=web&data.meta.keywords[1]=api')
      })
    })

    describe('encoding options', () => {
      it('should encode values only by default', () => {
        expect(stringify({ 'test key': 'test value' }))
          .toBe('test%20key=test%20value')
      })

      it('should encode both keys and values when encodeValuesOnly is false', () => {
        expect(stringify({ 'test key': 'test value' }, { encodeValuesOnly: false }))
          .toBe('test%20key=test%20value')
      })

      it('should not encode when encode is false', () => {
        expect(stringify({ 'test key': 'test value' }, { encode: false }))
          .toBe('test key=test value')
        expect(stringify({ arr: ['a b'] }, { encode: false }))
          .toBe('arr[0]=a b')
      })

      it('should handle special encoding scenarios', () => {
        expect(stringify({ 'test+plus': 'test+plus' }, { encode: true }))
          .toBe('test%2Bplus=test%2Bplus')
        expect(stringify({ 'test/': 'test/' }, { encode: true }))
          .toBe('test%2F=test%2F')
      })
    })

    describe('query prefix', () => {
      it('should not add query prefix by default', () => {
        expect(stringify({ foo: 'bar' })).toBe('foo=bar')
        expect(stringify({ foo: 'bar' }, { addQueryPrefix: false })).toBe('foo=bar')
      })

      it('should add query prefix when enabled', () => {
        expect(stringify({ foo: 'bar' }, { addQueryPrefix: true })).toBe('?foo=bar')
        expect(stringify({}, { addQueryPrefix: true })).toBe('?')
      })
    })

    describe('edge cases', () => {
      it('should handle empty arrays', () => {
        expect(stringify({ arr: [] })).toBe('')
      })

      it('should handle empty objects', () => {
        expect(stringify({ obj: {} })).toBe('')
      })

      it('should handle complex nested structures', () => {
        const complex = {
          user: {
            name: 'John Doe',
            age: 30,
            hobbies: ['reading', 'swimming'],
            address: {
              street: '123 Main St',
              city: 'New York',
              coords: {
                lat: 40.7128,
                lng: -74.0060,
              },
            },
          },
          tags: ['web', 'api'],
          meta: {
            created: '2023-01-01',
            updated: null,
          },
        }
        const result = stringify(complex)
        expect(result).toContain('user.name=John%20Doe')
        expect(result).toContain('user.age=30')
        expect(result).toContain('user.hobbies[0]=reading&user.hobbies[1]=swimming')
        expect(result).toContain('user.address.street=123%20Main%20St')
        expect(result).toContain('user.address.city=New%20York')
        expect(result).toContain('user.address.coords.lat=40.7128')
        expect(result).toContain('user.address.coords.lng=-74.006')
        expect(result).toContain('tags[0]=web&tags[1]=api')
        expect(result).toContain('meta.created=2023-01-01')
        expect(result).not.toContain('updated')
      })

      it('should handle numbers and booleans', () => {
        expect(stringify({ count: 0, active: true, flag: false }))
          .toBe('count=0&active=true&flag=false')
      })

      it('should handle numeric arrays in comma format', () => {
        expect(stringify({ ids: [1, 2, 3, 4, 5] }, { arrayFormat: 'comma' }))
          .toBe('ids=1%2C2%2C3%2C4%2C5')
      })

      it('should handle mixed type arrays in comma format', () => {
        expect(stringify({ mixed: ['a', 1, true, null, 'b'] }, { arrayFormat: 'comma' }))
          .toBe('mixed=a%2C1%2Ctrue%2Cb')
      })

      it('should handle objects in arrays', () => {
        const obj = {
          items: [
            { id: 1, name: 'item1' },
            { id: 2, name: 'item2' },
          ],
        }
        const result = stringify(obj)
        expect(result).toContain('items%5B0%5D.id=1')
        expect(result).toContain('items%5B0%5D.name=item1')
        expect(result).toContain('items%5B1%5D.id=2')
        expect(result).toContain('items%5B1%5D.name=item2')
      })
    })

    describe('custom options merging', () => {
      it('should merge custom options correctly', () => {
        const customOptions: QueryStringifyOptions = {
          arrayFormat: 'brackets',
          skipNulls: false,
          encode: false,
          addQueryPrefix: true,
        }

        expect(stringify({
          arr: ['a', 'b'],
          name: 'test',
          empty: null,
        }, customOptions))
          .toBe('?arr[]=a&arr[]=b&name=test&empty=')
      })

      it('should use default values for partial options', () => {
        expect(stringify({
          arr: ['x', 'y'],
        }, {
          arrayFormat: 'indices',
        }))
          .toBe('arr[0]=x&arr[1]=y')
      })
    })
  })
})
