import actions from './actions';
import initialState from '../../demoData/projectData.json';

const {
  changeLayoutBegin,
  changeLayoutSuccess,
  changeLayoutErr,
  changeRtlBegin,
  changeRtlSuccess,
  changeRtlErr,

  changeMenuBegin,
  changeMenuSuccess,
  changeMenuErr,

  singleProjectBegin,
  singleProjectSuccess,
  singleProjectErr,

  filterProjectBegin,
  filterProjectSuccess,
  filterProjectErr,

  sortingProjectBegin,
  sortingProjectSuccess,
  sortingProjectErr,
} = actions;

const changeLayoutMode = (value) => {
  return async (dispatch) => {
    try {
      dispatch(changeLayoutBegin());
      dispatch(changeLayoutSuccess(value));
    } catch (err) {
      dispatch(changeLayoutErr(err));
    }
  };
};

const changeRtlMode = (value) => {
  return async (dispatch) => {
    try {
      dispatch(changeRtlBegin());
      dispatch(changeRtlSuccess(value));
    } catch (err) {
      dispatch(changeRtlErr(err));
    }
  };
};

const changeMenuMode = (value) => {
  return async (dispatch) => {
    try {
      dispatch(changeMenuBegin());
      dispatch(changeMenuSuccess(value));
    } catch (err) {
      dispatch(changeMenuErr(err));
    }
  };
};

const sortingProjectByCategory = (sortBy) => {
  return async (dispatch) => {
    try {
      dispatch(sortingProjectBegin());
      const data = initialState.sort((a, b) => {
        return b[sortBy] - a[sortBy];
      });

      setTimeout(() => {
        dispatch(sortingProjectSuccess(data));
      }, 500);
    } catch (err) {
      dispatch(sortingProjectErr(err));
    }
  };
};

export { changeLayoutMode, changeRtlMode, changeMenuMode, sortingProjectByCategory };
