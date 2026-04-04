/**
 * FeedbackContext — lets test pages publish the currently displayed item
 * so that FeedbackButton (rendered outside the route tree) can include it
 * as context in translation feedback submissions.
 */
import { createContext, useContext, useState } from 'react'

const FeedbackContext = createContext(null)

export function FeedbackProvider({ children }) {
  const [itemContext, setItemContext] = useState({ itemId: null, itemText: null })
  return (
    <FeedbackContext.Provider value={{ itemContext, setItemContext }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedbackContext() {
  return useContext(FeedbackContext)
}
