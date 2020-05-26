import React, { useEffect, useState, Component } from 'react';
import { CardColumns, Card } from 'react-bootstrap';
import { useFirestoreCollection, useFirestoreDocData, useFirestore, SuspenseWithPerf} from 'reactfire';

let loadOnceLock = false;

function Models() {
  const [modelsData, setModels] = useState([]);
  const models = useFirestore()
    .collection('models');
  const modelList = useFirestoreCollection(models);

  useEffect(() => {
    if(!loadOnceLock) {
      loadOnceLock = true;
      models.get().then(function(querySnapshot) {
        let returnedModels = [];
            querySnapshot.forEach(function(doc) {
              let item = doc.data();
              item.id = doc.id;
              returnedModels.push(item);
            });
        console.log(returnedModels);
        setModels(returnedModels);
      });
    }
  });

  return <CardColumns>
      {
        React.Children.toArray(
          //modelList.docs.map((item, i) =>
          modelsData.map((item, i) =>
            <Card style={{ width: '18rem' }}>
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
                <Card.Link href={'#/model/' + item.id}>Train Model</Card.Link>
              </Card.Body>
            </Card>)
        )
      }
    </CardColumns>
}

class ModelList extends Component {
  constructor (props) {
    super(props)
    this.state = { apiStatus: 'Not called' }
  }

  componentDidMount() {
    //Burrito();
  }

  render () {
    return (
      <div className="ModelList">
        <SuspenseWithPerf
          fallback={'loading models status...'}
          traceId={'load-models-status'}
        >
          <Models />
        </SuspenseWithPerf>
      </div>
    )
  }
}

export default ModelList;
