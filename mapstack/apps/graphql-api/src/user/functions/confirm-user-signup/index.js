const handler = async (event) => {
  console.log("🚀 ~ file: index.js:13 ~ handler ~ event:", JSON.stringify( event, null, 2))
  
  return event
}

export { handler }
