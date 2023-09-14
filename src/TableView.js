import React, { Component } from 'react';
import './TableView.css'; // Import your CSS file
import { Alert } from 'react-bootstrap';

class TableView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableViewData: null,
      loading: true,
      editedValues: {},
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

    this.setState({ editedValues });
  }

  handleSendNotification(alert) {
    console.log("create JIRA ticket")
    window.alert("JIRA ticket has been created successfully")
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
            // Check if the severity is "critical"
            const isCritical = alert.severity === "CRITICAL";
            const isMedium = alert.severity === "MEDIUM";
            const isLow = alert.severity === "LOW";

            let severityClass = "";

            if (isCritical) {
              severityClass = "critical-cell";
            } else if (isMedium) {
              severityClass = "medium-cell";
            } else if (isLow) {
              severityClass = "low-cell";
            }

      return (
    

        <tr key={alert.alertID}>
          <td>{alert.alertID}</td>
          <td>
            {
              alert.createdtime}
          </td>
          <td>{alert.env}</td>
          <td>{alert.count}</td>
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

          <td className={severityClass}>{alert.severity}</td>
          <td>{resolution ? resolution.resolution : 'N/A'}</td>
          <td>{resolution ? resolution.team : 'N/A'}</td>
          <td>{resolution ? resolution.contact : 'N/A'}</td>
          <td>
      <button onClick={() => this.handleSendNotification(alert)}>
        Send Notification
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
              <button onClick={() => this.handleEditClick(alert.alertID)}>
                Edit
              </button>
            )}
          </td>
        </tr>
      );
    });

    return (
      <div>
      
        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Created Time</th>
              <th>Environment</th>
              <th>Count</th>
              <th>Active</th>
              <th>Severity</th>
              <th>Resolution</th>
              <th>Team</th>
              <th>Contact</th>
              <th>Notify</th>
             
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    );
  }
}

export default TableView;
