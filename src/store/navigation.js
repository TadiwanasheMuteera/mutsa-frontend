/**
 * Navigation utility for use in axios interceptors
 * Since hooks can't be used in interceptors, we store a reference to the navigate function
 */

let navigate = null

export const setNavigate = (navFn) => {
  navigate = navFn
}

export const getNavigate = () => {
  return navigate
}
