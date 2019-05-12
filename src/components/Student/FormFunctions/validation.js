import { string, object, date } from 'yup'

export const useValidateStudent = async (state) => {
  const {
    name, icNumber, dob, address, gender, nationality, classLevel, schoolName, otherFamily, fas, fsc, academicInfo, tuitionChoices,
    fatherName, fatherIcNumber, fatherNationality, fatherContactNumber, fatherEmail, fatherOccupation, fatherIncome, motherName,
    motherIcNumber, motherNationality, motherContactNumber, motherEmail, motherOccupation, motherIncome, admin, status
  } = state
  // Validate the important details
  const validateSchema = object({
    admin: object().shape({
      interviewDate: date('Please provide a valid interview date'),
      commencementDate: date('Please provide a valid commencement date'),
      exitDate: date('Please provide a valid exit date')
    }),
    fatherEmail: string().email('Please provide a valid email (father)'),
    fatherIcNumber: string().uppercase().matches(/^[STFG]\d{7}[A-Z]$/, { message: 'Please provide a valid IC Number (father)', excludeEmptyString: true }),
    fatherContactNumber: string().matches(/^[8|9]\d{7}$/, { message: 'Please provide a valid handphone number (Father)', excludeEmptyString: true }),
    fatherIncome: string().matches(/[0-9]+/, { message: 'Please provide a valid income (Father)', excludeEmptyString: true }),
    motherIncome: string().matches(/[0-9]+/, { message: 'Please provide a valid income (Mother)', excludeEmptyString: true }),
    motherContactNumber: string().matches(/^[8|9]\d{7}$/, { message: 'Please provide a valid handphone number (Mother)', excludeEmptyString: true }),
    motherEmail: string().email('Please provide a valid email (mother)'),
    motherIcNumber: string().uppercase().matches(/^[STFG]\d{7}[A-Z]$/, { message: 'Please provide a valid IC Number (mother)', excludeEmptyString: true }),
    classLevel: string().required('Please provide student class and level'),
    schoolName: string().required('Please provide student school name'),
    gender: string().required('Please provide student gender'),
    address: string().required('Please provide a valid address'),
    nationality: string().required('Please provide student nationality'),
    dob: date().required('Please provide a valid date of birth'),
    icNumber: string().required('Please provide an IC number').uppercase().matches(/^[STFG]\d{7}[A-Z]$/, 'Please provide a valid IC Number (Student)'),
    name: string().required('Please provide student name')
  })

  return validateSchema.validate({
    name, icNumber, dob, address, gender, nationality, classLevel, schoolName, fatherIcNumber, fatherEmail, fatherContactNumber, fatherIncome, motherContactNumber, motherIncome, motherIcNumber, motherEmail, admin
  }).then(valid => {
    // Take the keys of tuitonChoices (CDAC, Mendaki, Private) and reduce it
    // if the current value is true, that choice (known as current) would be added to the list of total choices (known as last)
    // else if that option is not checked (false), the list will remain the same as before (nothing added)
    const tuition = Object.keys(tuitionChoices).reduce((last, current) => (tuitionChoices[current] ? last.concat(current) : last
    ), [])

    const studentDataToSubmit = {
      name,
      icNumber,
      dob,
      address,
      gender,
      nationality,
      classLevel,
      schoolName,
      fatherName,
      fatherIcNumber,
      fatherNationality,
      fatherContactNumber,
      fatherEmail,
      fatherOccupation,
      fatherIncome,
      motherName,
      motherIcNumber,
      motherNationality,
      motherContactNumber,
      motherEmail,
      motherOccupation,
      motherIncome,
      otherFamily,
      fas,
      fsc,
      academicInfo,
      tuition,
      admin,
      status
    }
    const studentData = {
      studentDataToSubmit,
      status: true
    }
    return studentData
  }).catch(err => {
    if (err.name === 'ValidationError') {
      const errorDetails = {
        errors: err.errors[0],
        status: false
      }
      return errorDetails
    }
  })
}
