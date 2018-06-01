import axios from 'axios'

export function filterData (data, criteria) { // criteria = [{field, value}] where field is like 'profile-age' or 'profile-name'
  for (let criterion of criteria) {
    const { field, value } = criterion // example field is profile-age, value = ['M']
    return data.filter((item) => {
      if (/-/.test(field)) { // Check if the string '-' exists in the field and returns a bool
        const fieldArr = field.split('-') // fieldArr = ['profile', 'age'] if field is originally 'profile-age'
        return value.includes(item[fieldArr[0]][fieldArr[1]])
      } else {
        return value.includes(item[field])
      }
    }
    )
  }
}
