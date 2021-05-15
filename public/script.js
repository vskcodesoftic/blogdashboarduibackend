const fetchUsers = () => {
    axios.get('http://localhost:8001/')
        .then(response => {
            const users = response.data.data;
            console.log(`GET list users`, users);
        })
        .catch(error => console.error(error));
};

fetchUsers();