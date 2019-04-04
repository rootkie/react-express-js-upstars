export const filterData = (data, criteria) => { // criteria = [{field, value}]
  for (let criterion of criteria) {
    const { field, value } = criterion // example field is gender, value = ['M']
    return data.filter(item => {
      return value.includes(item[field])
    }
    )
  }
}
