exports.getSuggestedSentences = (doc2VecResponse) => {
  const sentences = JSON.parse(doc2VecResponse.Payload);
  const sentencesList = sentences.body.split(","); // seperated by commos
  const cleanedStr = sentencesList.toString().replace(/[[\]"]+/g, ""); // removing ",[,]
  const finalSentencesList = cleanedStr.split(","); // creating new js array
  /* const randomSentencesList = finalSentencesList
    .sort(() => Math.random() - Math.random())
    .slice(0, 5); // only 5 sentences will be shared
  const firstFiveSentenceList = finalSentencesList.slice(0, 5); */
  return firstFiveSentenceList.join("<br> --");
};
