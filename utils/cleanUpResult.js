const cleanUpResult = (result, question = false) => {
  if(question){
    const { __v,
      user,
      test, 
      completedAt, 
      updatedAt,
      createdAt,
      ...cleanResult } = result;
    return cleanResult;
  }
  const { __v,
    user,
    test, 
    completedAt, 
    updatedAt,
    questionResults,
    createdAt,
    ...cleanResult } = result;
    return cleanResult;
};

export default cleanUpResult;