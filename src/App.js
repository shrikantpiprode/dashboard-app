import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Modal, Button } from 'react-bootstrap'; // Import react-bootstrap components
import './App.css';
import TableView from './TableView';

function App() {
  const [data, setData] = useState([
    { id: 1, exception: 'Item 1', count: 'Item 1', timestamp: '2023-09-05', desc: 'Description 1', resolution: 'Resolution 1' },
    { id: 2, exception: 'Item 2', count: 'Item 1', timestamp: '2023-09-06', desc: 'Description 2', resolution: 'Resolution 2' },
    { id: 3, exception: 'Item 3', count: 'Item 1', timestamp: '2023-09-07', desc: 'Description 3', resolution: 'Resolution 3' },
  ]);

  // State to track selected rows
  const [selectedRows, setSelectedRows] = useState([]);
  
  // State to control the modal visibility
  const [showModal, setShowModal] = useState(false);

  // Function to handle row selection
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Function to send notifications
  const sendNotifications = () => {
    // Here, you can implement the logic to send notifications via email.
    // You might need a backend service or an email API to handle this.
    // For this example, we'll just log the selected rows to the console.
    console.log("Selected Rows:", selectedRows);

    // Close the modal
    setShowModal(false);
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Dashboard</span>
        </div>
      </nav>
      <div className="container mt-4">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Send Notification
        </button>
      <TableView/>
      </div>

      {/* Modal for sending notifications */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to send notifications to the selected rows?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={sendNotifications}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;