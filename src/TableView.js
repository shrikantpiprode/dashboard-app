import React, { Component } from 'react';
import './TableView.css'; // Import your CSS file
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button from react-bootstrap or any other library you prefer

class TableView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableViewData: null,
      loading: true,
      editedValues: {},
      showResolutionPopup: false, // State to control the Resolution popup visibility
      resolutionText: '', // State to store the full Resolution text
      showErrorDescPopup: false, // State to control the ErrorDesc popup visibility
      errorDescText: '', // State to store the full ErrorDesc text
    };
  }

  componentDidMount() {
    // Fetch data from the API
    fetch('http://localhost:8080/alerts/get-data')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          tableViewData: data,
          loading: false,
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  }
  handleEditClick(alertID) {
    // Clone the current edited values
    const editedValues = { ...this.state.editedValues };

    // Store the current row values in the editedValues state
    const alert = this.state.tableViewData.alert.find(
      (alert) => alert.alertID === alertID
    );
    editedValues[alertID] = { ...alert };

    this.setState({ editedValues });
  }

  handleInputChange(event, alertID, fieldName) {
    // Clone the current edited values
    const editedValues = { ...this.state.editedValues };

    // Update the edited value for the specific field
    editedValues[alertID][fieldName] = event.target.value;

    this.setState({ editedValues });
  }

  handleCancelEdit(alertID) {
    // Clone the current edited values
    const editedValues = { ...this.state.editedValues };

    // Remove the edited values for the specific alertID
    delete editedValues[alertID];

  }

  handleUpdateClick(alertID) {
    console.log(">>>>>>>",alertID)
    const editedAlert = this.state.editedValues[alertID];
    console.log(">>>>>>>",editedAlert)
    // After a successful update, you can remove the alertID from the editedValues state
    const editedValues = { ...this.state.editedValues };
    delete editedValues[alertID];

    this.setState({ editedValues });
    // Prepare the updated alert data
 // Prepare the updated alert data
 const updatedAlert = {
  id: alertID,
  active: editedAlert.active, // Convert 'Yes' to true, 'No' to false
};

fetch('http://localhost:8080/alerts/updateFEAlert', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(editedAlert),
})
  .then((response) => response.json())
  .then((updatedAlertResponse) => {
    // Handle the response from the server if needed
    console.log('Updated alert:', updatedAlertResponse);
    window.location.reload();
  })
  .catch((error) => {
    console.error('Error updating alert:', error);
  });
    
  }

  
  handleTruncateTextClick = (text) => {
    // For the generic popup, you can set the popupText state
    this.setState({
      showPopup: true,
      popupText: text,
    });
  };

  handleErrorDescClick = (text) => {
    // For the ErrorDesc popup, set the errorDescText state
    this.setState({
      showErrorDescPopup: true,
      errorDescText: text,
    });
  };

  handleResolutionClick = (text) => {
    // For the Resolution popup, set the resolutionText state
    this.setState({
      showResolutionPopup: true,
      resolutionText: text,
    });
  };

  handleClosePopup = () => {
    // Close both popups by resetting their respective states
    this.setState({
      showPopup: false,
      showErrorDescPopup: false,
      showResolutionPopup: false,
      popupText: '',
      errorDescText: '',
      resolutionText: '',
    });
  };

  handleSendNotification = (resdata) => {
    const summary = resdata.errorDesc; // Get the summary from alert.errorDesc
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>"+summary)
    const apiUrl = "http://localhost:8080/notification/jira";
  
    fetch(apiUrl, {
      method: "POST", // Assuming it's a GET request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(summary),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('JIRA Notification Response:', data);
        window.alert('JIRA ticket has been created successfully');
      })
      .catch((error) => {
        console.error('Error creating JIRA ticket:', error);
      });
  };
  

  render() {
    const { tableViewData, loading, editedValues } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!tableViewData) {
      return <div>Error: Data not available.</div>;
    }

    // Iterate through the data and create a table
    const tableRows = tableViewData.alert.map((alert) => {
      const resolution = tableViewData.alertsResolution.find(
        (ar) => ar.alertID === alert.alertID
      );

      const isEditing = !!editedValues[alert.alertID];
      const isCritical = alert.severity === 'CRITICAL';
      const isMedium = alert.severity === 'MEDIUM';
      const isLow = alert.severity === 'LOW';

      let severityClass = '';

      if (isCritical) {
        severityClass = 'critical-cell';
      } else if (isMedium) {
        severityClass = 'medium-cell';
      } else if (isLow) {
        severityClass = 'low-cell';
      }

      return (
        <tr key={alert.alertID}>
          <td>{alert.alertID}</td>
          <td>{alert.createdtime}</td>
          <td>{alert.env}</td>
          <td>{alert.count}</td>

          <td className="truncate-text" data-title="ErrorDesc">
            {resolution ? (
              <span
                className="clickable-text"
                onClick={() => this.handleErrorDescClick(resolution.errorDesc)}
              >
                {resolution.errorDesc.length > 20
                  ? `${resolution.errorDesc.substring(0, 20)}...`
                  : resolution.errorDesc}
              </span>
            ) : (
              'N/A'
            )}
          </td>
          <td className={severityClass}>{alert.severity}</td>
          <td className="truncate-text" data-title="Resolution">
            {resolution ? (
              <span
                className="clickable-text"
                onClick={() => this.handleResolutionClick(resolution.resolution)}
              >
                {resolution.resolution}
              </span>
            ) : (
              'N/A'
            )}
          </td>
          <td>{resolution ? resolution.team : 'N/A'}</td>
          <td>{resolution ? resolution.contact : 'N/A'}</td>
          <td>
            {isEditing ? (
              <select
                value={editedValues[alert.alertID]?.active || ''}
                onChange={(e) =>
                  this.handleInputChange(e, alert.alertID, 'active')
                }
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            ) : (
              alert.active
            )}
          </td>
          <td>
            <button style={{color:'white',backgroundColor:'green'}}
              className="jira-button"
              onClick={() => this.handleSendNotification(resolution)}
            >
              Create JIRA
            </button>
          </td>
          <td>
            {isEditing ? (
              <div>
                <button onClick={() => this.handleUpdateClick(alert.alertID)}>
                  Update
                </button>
                <button onClick={() => this.handleCancelEdit(alert.alertID)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button style={{color:'white',backgroundColor:'blue'}}
                className="edit-button"
                onClick={() => this.handleEditClick(alert.alertID)}
              >
                Edit
              </button>
            )}
          </td>
        </tr>
      );
    });

    return (
      <div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Created Time</th>
                <th>Environment</th>
                <th>Count</th>
                <th>ErrorDesc</th>
                <th>Severity</th>
                <th>Resolution</th>
                <th>Team</th>
                <th>Contact</th>
                <th>Active</th>
                <th>Notify</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
        {/* Separate modals for ErrorDesc and Resolution */}
        <Modal show={this.state.showResolutionPopup} onHide={this.handleClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Resolution</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.resolutionText}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClosePopup}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showErrorDescPopup} onHide={this.handleClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>ErrorDesc</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.errorDescText}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClosePopup}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default TableView;
