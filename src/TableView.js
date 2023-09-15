import React, { Component } from 'react';
import './TableView.css';
import { Modal, Button } from 'react-bootstrap';

class TableView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableViewData: null,
      loading: true,
      editedValues: {},
      showResolutionPopup: false,
      resolutionText: '',
      showErrorDescPopup: false,
      errorDescText: '',
      sortBy: 'alertID', // Initial column to sort by
      sortAsc: true, // Initial sorting order (ascending)
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

  handleSort = (column) => {
    const { sortAsc, sortBy } = this.state;

    // If the same column is clicked again, reverse the sorting order
    const newSortAsc = column === sortBy ? !sortAsc : true;

    // Update the state with the new sorting column and order
    this.setState({
      sortBy: column,
      sortAsc: newSortAsc,
    });
  };

  handleInputChange(event, alertID, fieldName) {
    // Clone the current edited values
    const editedValues = { ...this.state.editedValues };

    // Update the edited value for the specific field
    editedValues[alertID][fieldName] = event.target.value;

    this.setState({ editedValues });
  }

  handleEditClick(alertID) {
    // Clone the current edited values
    const editedValues = { ...this.state.editedValues };

    // Store the current row values in the editedValues state
    const alert = this.state.tableViewData.alert.find(
      (alert) => alert.alertID === alertID
    );
    editedValues[alertID] = { ...alert };

    // Set the isEditing property for the selected row to true
    editedValues[alertID].isEditing = true;

    this.setState({ editedValues });
  }

  handleCancelEdit(alertID) {
    // Clone the current edited values
    const editedValues = { ...this.state.editedValues };

    // Remove the edited values for the specific alertID
    delete editedValues[alertID];

    // Set the isEditing property for the selected row to false
    const alertIndex = this.state.tableViewData.alert.findIndex(
      (alert) => alert.alertID === alertID
    );
    this.state.tableViewData.alert[alertIndex].isEditing = false;

    this.setState({ editedValues });
  }

  handleUpdateClick(alertID) {
    const editedAlert = this.state.editedValues[alertID];
    // After a successful update, you can remove the alertID from the editedValues state
    const editedValues = { ...this.state.editedValues };
    delete editedValues[alertID];

    this.setState({ editedValues });

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
    let summary = resdata.errorDesc;

  if (resdata.errorDesc.length > 200) {
    // If errorDesc has more than 200 characters, truncate it
    summary = resdata.errorDesc.substring(0, 200);
  }
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>' + summary);
    const apiUrl = 'http://localhost:8080/notification/jira';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(summary),
    })
     
      .then((response) => {
        console.log('JIRA Notification Response:', response);
        window.alert('JIRA ticket has been created successfully');
      })
      .catch((error) => {
        console.error('Error creating JIRA ticket:', error);
      });
  };

  render() {
    const { tableViewData, loading, editedValues, sortBy, sortAsc } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!tableViewData) {
      return <div>Error: Data not available.</div>;
    }

    // Sort the alert data based on the selected column and order
    const sortedAlerts = tableViewData.alert.slice().sort((a, b) => {
      const sortValueA = a[sortBy];
      const sortValueB = b[sortBy];

      if (sortValueA < sortValueB) {
        return sortAsc ? -1 : 1;
      }
      if (sortValueA > sortValueB) {
        return sortAsc ? 1 : -1;
      }
      return 0;
    });

    // Iterate through the sorted data and create a table
    const tableRows = sortedAlerts.map((alert) => {
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
          <td className="truncate-text1" data-title="ErrorDesc">
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
            <button
              style={{ color: 'white', backgroundColor: 'green' }}
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
              <button
                style={{ color: 'white', backgroundColor: 'blue' }}
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
                <th onClick={() => this.handleSort('alertID')}>
                  Alert ID{' '}
                  {sortBy === 'alertID' && (
                    <span>{sortAsc ? '▲' : '▼'}</span>
                  )}
                </th>
                <th onClick={() => this.handleSort('createdtime')}>
                  Created Time{' '}
                  {sortBy === 'createdtime' && (
                    <span>{sortAsc ? '▲' : '▼'}</span>
                  )}
                </th>
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
        <Modal
          show={this.state.showResolutionPopup}
          onHide={this.handleClosePopup}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Resolution</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {this.state.resolutionText}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClosePopup}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.showErrorDescPopup}
          onHide={this.handleClosePopup}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>ErrorDesc</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {this.state.errorDescText}
          </Modal.Body>
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
