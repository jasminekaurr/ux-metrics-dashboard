/**
 * fcubTickets.js — re-export FCUB lifecycle sample issues from JSON.
 *
 * Prefer `useDashboardData().fcubComponentVenn.issues` in React trees.
 *
 * @CUSTOMIZE — Edit dashboard/src/data/sample/fcubComponentVenn.json
 * Related: data/sample/fcubComponentVenn.json
 */
import sampleFcub from './sample/fcubComponentVenn.json'

export const ALL_TICKETS = sampleFcub.issues || []

export default ALL_TICKETS
