import React, { useEffect, useState, Component, Container } from 'react'
import { useFirestoreCollection, useFirestoreDocData, useFirestore, SuspenseWithPerf} from 'reactfire';
import { useParams} from "react-router";
import { Col, Row, Nav, NavDropdown, Form, Button, Navbar } from "react-bootstrap";
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { fromDatasetObject, toDatasetObject } from '../utils/tfUtils';

const classifier = knnClassifier.create();
let loadOnceLock = false;
let lastImg = "#";

let localMobilenet;
let loadModel = async () => {
  localMobilenet = await mobilenet.load();
}
loadModel();

const ModelInfo = () => {
  let { id } = useParams();
  const [imgSrc, setSrc] = useState("#");
  const [classes, setClasses] = useState([]);
  const [model, setModel] = useState([]);
  const [imgQueue, setQueue] = useState([]);
  const [prediction, setPrediction] = useState([]);
  const [confidence, setConfidence] = useState([]);
  const [mobilenetPrediction, setMobilenetPrediction] = useState([]);
  const [trainingCounts, setTrainingCounts] = useState([]);
  let img = document.createElement('img');

  const modelRef = useFirestore()
    .collection('models')
    .doc(id);
  
  const modelData = useFirestoreDocData(modelRef);
  if(modelData.data && !loadOnceLock) {
    loadOnceLock = true;
    const datasetObj = JSON.parse(modelData.data);
    const dataset = fromDatasetObject(datasetObj);
    classifier.setClassifierDataset(dataset);
  }

  let displayQueue = async (photos) => {
    if(photos.length > 0) {
      setSrc(photos[0]);
      photos.shift();
      setQueue(photos);
    } else {
      predictImage();
    }
  }

  let loadImg = async (photos) => {
    if (photos && photos[0]) {
      let queue = [];
      for (let i = 0; i < photos.length; i++) {
        let reader = new FileReader();
        reader.onload = function (e) {
          let src = e.target.result;
          queue.push(src);
          if(i == photos.length - 1) {
            setQueue(queue);
            displayQueue(queue);
          }
        };
        reader.readAsDataURL(photos[i]);
      }
    }
  }

  let predictImage = async () => {
    await img.setAttribute('src', imgSrc);
    img.setAttribute('width', '600px');
    img.setAttribute('height', '600px');
    const mobilenetClasses = await localMobilenet.classify(img);
    setMobilenetPrediction(mobilenetClasses);
    if (classifier.getNumClasses() > 0) {
      const activation = await localMobilenet.infer(img, 'conv_preds');
      const result = await classifier.predictClass(activation);
      setPrediction(result.label);
      setConfidence(result.confidences);
      setTrainingCounts(classifier.classExampleCount);
    }
  }

  // Run predict image if image src changes
  if(imgSrc != lastImg && imgSrc != "#") {
    lastImg = imgSrc;
    predictImage();
  }

  let classifyImage = async (classId) => {
    img.setAttribute('src', imgSrc);
    const activation = localMobilenet.infer(img, 'conv_preds');
    await classifier.addExample(activation, classId);

    let photos = imgQueue;
    displayQueue(photos);      
  }

  const updateModel = async commonName => {
    let newModel = {};
    newModel.name = model.name;
    newModel.description = model.description;
    newModel.classes = model.classes;
    const dataset = classifier.getClassifierDataset();
    const datasetOjb = await toDatasetObject(dataset);
    const jsonStr = JSON.stringify(datasetOjb);
    newModel.data = jsonStr;
    modelRef.update(newModel);
  }

  useEffect(() => {
    setClasses(modelData.classes);
    setModel(modelData);
  })

  return (
    <div>
      <Navbar expand="lg" variant="light" bg="light">
        <Nav>
          <Nav.Link href="/">Models</Nav.Link>
          {/*<NavDropdown title="Classes" id="basic-nav-dropdown">*/}
            {classes.map((item, i) =>
              //<NavDropdown.Item onClick={() => classifyImage(item)} >{item}</NavDropdown.Item>
              <Button onClick={() => classifyImage(item)} >{item}</Button>
            )}
          {/*</NavDropdown>*/}
          <Form inline>
            <input
              type="file"
              id="custom-file"
              label="Load Image"
              onChange={ (e) => loadImg(e.target.files) }
              custom
              multiple
            />
          </Form>
          <Button 
            onClick={updateModel}
            variant="outline-info">Save</Button>
        </Nav>
      </Navbar>
  <Row>
    <Col style={{ margin: '50px', textAlign: 'left'}}>
          <p><b>Instructions: </b> Upload images which coorispond to a class, and press the associated button.
          This improves the model. If you want to save your training progress press the save button to update the model permanently.</p>
          <p><b>Prediction: </b> {prediction}</p>
          <p><b>Confidence: </b> <i>{JSON.stringify(confidence)}</i></p>
          <p><b>Raw Mobilenet Tags: </b>
            <i>{mobilenetPrediction.map((item, i) =>
              item.probability.toFixed(2) + " " + item.className + ",  "
            )}</i>
          </p>
          <p><b>Traing Done:</b> <i>{JSON.stringify(trainingCounts)}</i></p>
    </Col>
    <Col>
      <img width="100%" src={imgSrc}/>
    </Col>
  </Row>
    </div>
  );
}

class ModelPage extends Component {
  render () {
    return (
      <div className="App">
        <SuspenseWithPerf
          fallback={'loading models status...'}
          traceId={'load-models-status'}
        >
          <ModelInfo />
        </SuspenseWithPerf>
      </div>
    );
  }
}

export default ModelPage;
