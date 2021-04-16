exports.getSuggestedSentences = (doc2VecResponse) => {
  const sentences = JSON.parse(doc2VecResponse.Payload);
  const sentencesList = sentences.body.split(","); // seperated by commos
  const cleanedStr = sentencesList.toString().replace(/[[\]"]+/g, ""); // removing ",[,]
  const finalSentencesList = cleanedStr.split(","); // creating new js array
  /* const randomSentencesList = finalSentencesList
    .sort(() => Math.random() - Math.random())
    .slice(0, 5); // only 5 sentences will be shared */
  /* const firstFiveSentenceList = finalSentencesList.slice(0, 5);
  return firstFiveSentenceList.join("<br> --"); */
  const response =
    `<button type="button" onclick="document.getElementById('wisdom').value='${finalSentencesList[0]}'; return pushChat();">${finalSentencesList[0]}</button><br>` +
    `<button type="button" onclick="document.getElementById('wisdom').value='${finalSentencesList[1]}'; return pushChat();">${finalSentencesList[1]}</button><br>` +
    `<button type="button" onclick="document.getElementById('wisdom').value='${finalSentencesList[2]}'; return pushChat();">${finalSentencesList[2]}</button><br>` +
    `<button type="button" onclick="document.getElementById('wisdom').value='${finalSentencesList[3]}'; return pushChat();">${finalSentencesList[3]}</button><br>` +
    `<button type="button" onclick="document.getElementById('wisdom').value='${finalSentencesList[4]}'; return pushChat();">${finalSentencesList[4]}</button><br>`;
  return response;
};
