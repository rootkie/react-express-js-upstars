export function filterData (data, criteria) { // criteria = [{field, value}]
  for (let criterion of criteria) {
    const { field, value } = criterion // field is profile-age, value = ['M']
    return data.filter((item) => {
      if (/-/.test(field)) {
        const fieldArr = field.split('-') // fieldArr = ['profile', 'age']
        return value.includes(item[fieldArr[0]][fieldArr[1]])
      } else {
        return value.includes(item[field])
      }
    }
    )
  }
}
