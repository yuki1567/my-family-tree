import { GRAPHQL } from './constants.js'

export const FETCH_PROJECT_ISSUES_QUERY = `
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: ${GRAPHQL.LIMITS.PROJECT_ITEMS}) {
          nodes {
            id
            fieldValueByName(name: "${GRAPHQL.FIELD_NAMES.STATUS}") {
              ... on ProjectV2ItemFieldSingleSelectValue {
                optionId
              }
            }
            content {
              ... on Issue {
                number
                title
                labels(first: ${GRAPHQL.LIMITS.ISSUE_LABELS}) {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const UPDATE_PROJECT_ITEM_STATUS_MUTATION = `
  mutation($projectId: ID!, $itemId: ID!, $statusFieldId: ID!, $statusValueId: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $statusFieldId
        value: { singleSelectOptionId: $statusValueId }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`

export const FETCH_STATUS_FIELD_ID_QUERY = `
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        field(name: "${GRAPHQL.FIELD_NAMES.STATUS}") {
          ... on ProjectV2SingleSelectField {
            id
          }
        }
      }
    }
  }
`
