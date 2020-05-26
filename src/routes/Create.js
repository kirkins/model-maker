import React, { useState, Component } from 'react'
import TopBar from '../components/TopBar';
import { Button, Form, FormControl, Col } from 'react-bootstrap';
import { SuspenseWithPerf, useFirestore, useDatabase } from 'reactfire';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

const classifier = knnClassifier.create();

const CreateModel = () => {
  const [classes, setClasses] = useState([""]);
  const [name, setName] = useState("my model");
  const [description, setDescription] = useState("this is an image classification model.");
  const firestore = useFirestore();
  const ref = firestore.collection('models');

  const addModel = async commonName => {
    let newModel = {};
    newModel.name = name;
    newModel.description = description;
    newModel.classes = classes;
    newModel.data = null;
    let newModelRef = await ref.add(newModel);
    window.location.href = "/#/model/" + newModelRef.id;
  }

  const addClass = className => {
    let tempClasses = [...classes, className];
    setClasses(tempClasses);
  }

  const updateClass = (i, text) => {
    let tempClasses = [...classes];
    tempClasses[i] = text;
    setClasses(tempClasses);
  }

  return (
    <div>
      <Form width="600px">
        <Form.Row>
          <Form.Group>
            <Form.Control 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="name"
            />
            <Form.Control
              value={description}
              onChange={e => setDescription(e.target.value)}
              as="textarea"
              placeholder="description"
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
          {classes.map((item, i) =>
            <Form.Control
              placeholder="class name"
              onChange={e => updateClass(i, e.target.value)}
              value={item}/>
          )}
          </Form.Group>
        </Form.Row>
      </Form>
      <Button
        onClick={() => addClass("")}
      >
        Add Class
      </Button>
      <Button onClick={() => addModel("anything")}>Create</Button>
    </div>
  );
}

class Create extends Component {
render () {
  return (
    <div className="Create">
      <TopBar/>
      <SuspenseWithPerf fallback="loading..." traceId="RTDB-root">
      <CreateModel/>
      </SuspenseWithPerf>
    </div>
  );
}
}

export default Create;
