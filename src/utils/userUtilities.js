
async function getRegistrationStatus() {
    try {
        const response = await fetch('/api/getregistrationstatus', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log("Error checking registration status")
        return false;
    }
}

async function isLoggedIn() {
    try {
        const response = await fetch('/api/email', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem("token")
            }
        });
        if (!response.ok) {
            document.getElementById("dd-login").style.display = "block";
            document.getElementById("dd-logout").style.display = "none";
            document.getElementById("dd-dashboard").style.display = "none";
        } else {
            document.getElementById("dd-dashboard").style.display = "block";
            document.getElementById("dd-login").style.display = "none";
        }
    } catch (error) {
        document.getElementById("dd-login").style.display = "block";
        document.getElementById("dd-logout").style.display = "none";
        document.getElementById("dd-dashboard").style.display = "none";
    }
}

module.exports = {
    getRegistrationStatus,
    isLoggedIn
}