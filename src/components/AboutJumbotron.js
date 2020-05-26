import React, { useState, Component } from 'react';
import { Form, Jumbotron, Button, Carousel } from 'react-bootstrap';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Link } from 'react-router-dom'

let localMobilenet;
let loadModel = async () => {
  localMobilenet = await mobilenet.load();
}
loadModel();

const TutorialSlider = () => {
  const [index, setIndex] = useState(0);
  const [classes, setClasses] = useState([]);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  let loadImg = async (photos) => {
    if (photos && photos[0]) {
      let reader = new FileReader();
      reader.onload = async (e) => {
        let img = document.createElement('img');
        let src = e.target.result;
        await img.setAttribute('src', src);
        img.setAttribute('width', '600px');
        img.setAttribute('height', '600px');
        const mobilenetClasses = await localMobilenet.classify(img);
        setClasses(mobilenetClasses);
      };
      reader.readAsDataURL(photos[0]);
    }
  }

  return (
    <Carousel activeIndex={index} interval={null} onSelect={handleSelect}>
      <Carousel.Item>
        <Jumbotron>
          <h1>Build your own image classifier!</h1>
          <p width="600px">
            This web app allows you to easily make and share a custom image classification model. It works by creating a classifier layer on top of a
            powerful general purpose vision CNN <i>(Convolutional Neural Network)</i> which tags images.
          </p>
          <p>
            <Button onClick={() => handleSelect(1)} variant="primary">Mobilenet?</Button>
          </p>
        </Jumbotron>

      </Carousel.Item>
      <Carousel.Item>
        <Jumbotron>
          <h1>What is a mobilenet?</h1>
          <p>
            A mobilenet is an efficient CNN made for Mobile Vision Applications.
            <br/>
            <b>Try uploading an image below</b> to see what tags are produced by the standard tfjs.js mobilenet.
          </p>
          <p>
            <input onChange={ (e) => loadImg(e.target.files)} type="file"/>
            <br/>
              <i>{classes.map((item, i) =>
                item.probability.toFixed(2) + " " + item.className + ",  "
              )}</i>
          </p>
          <p>But what about classes the mobilenet doesn't know about? For example characters from a cartoon?</p>
          <p>
            <Button onClick={() => handleSelect(2)} variant="primary">KNN Transfer Learning</Button>
          </p>
        </Jumbotron>

      </Carousel.Item>
      <Carousel.Item>
        <Jumbotron>
          <h1>KNN Transfer Learning</h1>
          <p>
            Transfer learning is when a new model is built by transfering knowledge from an existing model. It allows a classifier to be created with only a handful of images,
            when normally hundreds or thousands would be needed. KNN (k-Nearest Neighbours) is an algorithm which takes an input and returns the most similiar entries.
            We can train a KNN classifier by initially deciding on a set of classes, for example Batman or Spiderman. Then we upload examples of both and press the button
            for the tag associated with the image.
          </p>
          <p><b>Try Example Classifiers:</b></p>
          <Link  target="_blank" to="/model/5Jko0yPrYd27uYsmZHlu">Batman vs. Spiderman</Link>
          <br/>
          <Link  target="_blank" to="/model/DdVgUFZxSs2zeYnPZym0">Pepsi Logo vs. Coke Logo</Link>
          <br/>
          <br/>
          <p>
            <Link to="/create"><Button variant="primary">Create a model</Button></Link>
          </p>
        </Jumbotron>

      </Carousel.Item>
    </Carousel>
  );
}

export default TutorialSlider;
