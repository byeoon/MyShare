async function getRegistrationStatus() {
    try {
        const response = await fetch('/api/getregistrationstatus', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log('Error checking registration status');
        return false;
    }
}

module.exports = {
    getRegistrationStatus,
};
