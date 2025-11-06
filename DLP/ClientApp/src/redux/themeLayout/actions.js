const actions = {
  CHANGE_LAYOUT_MODE_BEGIN: 'CHANGE_LAYOUT_MODE_BEGIN',
  CHANGE_LAYOUT_MODE_SUCCESS: 'CHANGE_LAYOUT_MODE_SUCCESS',
  CHANGE_LAYOUT_MODE_ERR: 'CHANGE_LAYOUT_MODE_ERR',

  CHANGE_RTL_MODE_BEGIN: 'CHANGE_RTL_MODE_BEGIN',
  CHANGE_RTL_MODE_SUCCESS: 'CHANGE_RTL_MODE_SUCCESS',
  CHANGE_RTL_MODE_ERR: 'CHANGE_RTL_MODE_ERR',

  CHANGE_MENU_MODE_BEGIN: 'CHANGE_MENU_MODE_BEGIN',
  CHANGE_MENU_MODE_SUCCESS: 'CHANGE_MENU_MODE_SUCCESS',
  CHANGE_MENU_MODE_ERR: 'CHANGE_MENU_MODE_ERR',

  SINGLE_PROJECT_BEGIN: 'SINGLE_PROJECT_BEGIN',
  SINGLE_PROJECT_SUCCESS: 'SINGLE_PROJECT_SUCCESS',
  SINGLE_PROJECT_ERR: 'SINGLE_PROJECT_ERR',

  FILTER_PROJECT_BEGIN: 'FILTER_PROJECT_BEGIN',
  FILTER_PROJECT_SUCCESS: 'FILTER_PROJECT_SUCCESS',
  FILTER_PROJECT_ERR: 'FILTER_PROJECT_ERR',

  SORTING_PROJECT_BEGIN: 'SORTING_PROJECT_BEGIN',
  SORTING_PROJECT_SUCCESS: 'SORTING_PROJECT_SUCCESS',
  SORTING_PROJECT_ERR: 'SORTING_PROJECT_ERR',

  changeLayoutBegin: () => {
    return {
      type: actions.CHANGE_LAYOUT_MODE_BEGIN,
    };
  },

  changeLayoutSuccess: (data) => {
    return {
      type: actions.CHANGE_LAYOUT_MODE_SUCCESS,
      data,
    };
  },

  changeLayoutErr: (err) => {
    return {
      type: actions.CHANGE_LAYOUT_MODE_ERR,
      err,
    };
  },

  changeRtlBegin: () => {
    return {
      type: actions.CHANGE_RTL_MODE_BEGIN,
    };
  },

  changeRtlSuccess: (data) => {
    return {
      type: actions.CHANGE_RTL_MODE_SUCCESS,
      data,
    };
  },

  changeRtlErr: (err) => {
    return {
      type: actions.CHANGE_RTL_MODE_ERR,
      err,
    };
  },

  changeMenuBegin: () => {
    return {
      type: actions.CHANGE_MENU_MODE_BEGIN,
    };
  },

  changeMenuSuccess: (data) => {
    return {
      type: actions.CHANGE_MENU_MODE_SUCCESS,
      data,
    };
  },

  changeMenuErr: (err) => {
    return {
      type: actions.CHANGE_MENU_MODE_ERR,
      err,
    };
  },

  singleProjectBegin: () => {
    return {
      type: actions.SINGLE_PROJECT_BEGIN,
    };
  },

  singleProjectSuccess: (data) => {
    return {
      type: actions.SINGLE_PROJECT_SUCCESS,
      data,
    };
  },

  singleProjectErr: (err) => {
    return {
      type: actions.SINGLE_PROJECT_ERR,
      err,
    };
  },

  filterProjectBegin: () => {
    return {
      type: actions.FILTER_PROJECT_BEGIN,
    };
  },

  filterProjectSuccess: (data) => {
    return {
      type: actions.FILTER_PROJECT_SUCCESS,
      data,
    };
  },

  filterProjectErr: (err) => {
    return {
      type: actions.FILTER_PROJECT_ERR,
      err,
    };
  },

  sortingProjectBegin: () => {
    return {
      type: actions.SORTING_PROJECT_BEGIN,
    };
  },

  sortingProjectSuccess: (data) => {
    return {
      type: actions.SORTING_PROJECT_SUCCESS,
      data,
    };
  },

  sortingProjectErr: (err) => {
    return {
      type: actions.SORTING_PROJECT_ERR,
      err,
    };
  },
};

export default actions;
