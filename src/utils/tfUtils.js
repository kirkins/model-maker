import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
const classifier = knnClassifier.create();

export const toDatasetObject = async (dataset) => {
  const result = await Promise.all(
    Object.entries(dataset).map(async ([classId,value], index) => {
      const data = await value.data();

      return {
        classId: String(classId),
        data: Array.from(data),
        shape: value.shape
      };
   })
  );

  return result;
};

export const fromDatasetObject = (datasetObject) => {
  console.log("object here");
  console.log(datasetObject);
  return Object.entries(datasetObject).reduce((result, [indexString, {classId, data, shape}]) => {
    const tensor = tf.tensor2d(data, shape);
    result[classId] = tensor;
    console.log("result");
    console.log(result);
    return result;
  }, {});

}

