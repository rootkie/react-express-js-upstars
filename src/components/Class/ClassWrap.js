import React, { useEffect, useReducer } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import ClassEdit from './Edit/ClassEdit.js'
import axios from 'axios'
import ErrorPage from '../Error/ErrorPage'
const source = axios.CancelToken.source()

const initialState = {
  classData: [],
  isLoading: true
}

/*
===================
FUNCTIONS
===================
*/

const getClasses = (dispatch) => {
  axios.get('class', {cancelToken: source.token})
    .then(response => {
      const { activeClasses, stoppedClasses } = response.data
      // Merge both together to show it in a single table
      const updatedClassData = activeClasses.concat(stoppedClasses)
      dispatch({type: 'setClass', updatedClassData})
    })
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'setClass':
      return {
        ...state,
        classData: action.updatedClassData,
        isLoading: false
      }
    case 'updateClasses':
      return {
        ...state,
        isLoading: true
      }
    default:
      return state
  }
}

const ClassWrap = ({match, roles}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getClasses(dispatch)

    return () => {
      source.cancel('API cancelled')
    }
  }, [])

  /*
  =========================================
  PROP FUNCTIONS TO BE PASSED TO CHILDREN
  =========================================
  */

  const addClass = async (classDataToSubmit) => {
    const { classData } = state
    dispatch({type: 'updateClasses'})
    const response = await axios.post('/class', classDataToSubmit)
    // Adds the new class to the array of ACTIVE classes so that when you click view you can see it immediately.
    const updatedClassData = [
      ...classData,
      {
        ...classDataToSubmit,
        _id: response.data.newClassId,
        status: 'Active'
      }]
    dispatch({type: 'setClass', updatedClassData})
    return response.data.newClassId
  }

  const editClass = async (classDataToSubmit, classId) => {
    const { classData } = state
    await axios.put('/class', {
      ...classDataToSubmit,
      classId
    })
    // Loop through and if that array contains the same _id as the request id (sid), change it and leaving the rest the same.
    // This allows the ClassName edited and shown on the overview page to update instantly.
    const arrayIndex = classData.findIndex(x => x._id === classId)
    const updatedClassData = [...classData]
    updatedClassData.splice(arrayIndex, 1, { ...classDataToSubmit, _id: classId })
    // const updatedClassData = classData.map((element) => (element._id === sid ? { ...classDataToSubmit, _id: sid } : element))
    dispatch({type: 'setClass', updatedClassData})
  }

  const stopClass = async (classIds) => {
    const data = {
      classId: classIds
    }
    await axios.delete('/class', {
      data
    })
    getClasses(dispatch)
  }

  /*
  ===========
  RENDER
  ===========
  */

  const { classData, isLoading } = state
  return (
    <React.Fragment>
      <Switch>
        <Route exact path={`${match.path}/add`} render={() => <ClassForm addClass={addClass} />} />
        <Route exact path={`${match.path}/id/:id`} render={props => <ClassEdit editClass={editClass} roles={roles} {...props} />} />
        <Route exact path={`${match.path}/view`} render={() => <ClassView classData={classData} stopClass={stopClass} isLoading={isLoading} roles={roles} />} />
        <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
      </Switch>
      <Grid>
        <Grid.Row></Grid.Row>
      </Grid>
    </React.Fragment>
  )
}

ClassWrap.propTypes = {
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}
export default ClassWrap
