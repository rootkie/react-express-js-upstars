filterPropData = (checkArray) => {
  const { studentData } = this.props
  return Object.keys(studentData).reduce((last, curr) => (checkArray.includes(curr) ? {...last, [curr]: studentData[curr]} : last
  ), {})
}

state = this.props.studentData ? {
  ...this.filterPropData(['profile', 'father', 'mother', 'otherFamily', 'misc', 'admin']),
  profile: {...this.props.studentData.profile, dob: moment(this.props.studentData.profile.dob)
  }, // reformat dob to moment object

  terms: false,
  termsDetails: false,
  tuitionChoices: {
    CDAC: this.props.studentData.misc.tuition.includes('CDAC') || false,
    Mendaki: this.props.studentData.misc.tuition.includes('Mendaki') || false,
    Private: this.props.studentData.misc.tuition.includes('Private') || false
  },
  submitSuccess: false,
  error: []
}
  : { ...initialState, submitSuccess: false }
