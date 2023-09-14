import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import './App.css';
import TableView from './TableView';

function App() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAlertData, setNewAlertData] = useState({
    alertID: '',
    createdtime: '',
    env: '',
    count: 0,
    active: true,
    severity: '',
  });

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const sendNotifications = () => {
    console.log("Selected Rows:", selectedRows);
    setShowModal(false);
  };

  const handleAddAlert = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFormSubmit = () => {
    // Here, you can add the logic to call the API as a POST request to create a new alert.
    // You can use the fetch API or a library like Axios for making the POST request.

    fetch('http://localhost:8080/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAlertData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('New Alert Created:', data);
        setShowModal(false); // Close the modal
        // You can add logic to refresh the alert table or handle the response as needed.
      })
      .catch((error) => {
        console.error('Error creating new alert:', error);
      });
      window.location.reload();
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
        <div className="logo">
            <img src="/cisco_logo.jpeg"  width="40" height="40" /> {/* Add your logo here */}
            <span  className="navbar-brand mb-0 h1"> <h2 style={{margin:10, padding:20}}> EagleView Dashboard</h2> </span>
          </div>
        </div>
      </nav>
        <h2>Real-Time Critical Alerts Monitor</h2>
      <div className="container mt-4">
      <div className="button-container">
            <Button variant="primary" onClick={handleAddAlert}>
              Add New Alert
            </Button>
          </div>
        <TableView />
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Alert</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="alertID">
                <Form.Label>Alert ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Alert ID"
                  value={newAlertData.alertID}
                  onChange={(e) =>
                    setNewAlertData({ ...newAlertData, alertID: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="createdtime">
                <Form.Label>Created Time</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Created Time"
                  value={newAlertData.createdtime}
                  onChange={(e) =>
                    setNewAlertData({ ...newAlertData, createdtime: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="env">
                <Form.Label>Environment</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Environment"
                  value={newAlertData.env}
                  onChange={(e) =>
                    setNewAlertData({ ...newAlertData, env: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="count">
                <Form.Label>Count</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Count"
                  value={newAlertData.count}
                  onChange={(e) =>
                    setNewAlertData({ ...newAlertData, count: parseInt(e.target.value) })
                  }
                />
              </Form.Group>
              <Form.Group controlId="active">
                <Form.Label>Active</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={newAlertData.active}
                  onChange={(e) =>
                    setNewAlertData({ ...newAlertData, active: e.target.checked })
                  }
                />
              </Form.Group>
              <Form.Group controlId="severity">
                <Form.Label>Severity</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Severity"
                  value={newAlertData.severity}
                  onChange={(e) =>
                    setNewAlertData({ ...newAlertData, severity: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleFormSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default App;
