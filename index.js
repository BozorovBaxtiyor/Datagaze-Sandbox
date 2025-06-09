async function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = { name: 'John Doe', age: 30 };
      resolve(data);
    }, 2000); // Simulate a 2-second delay
  }
  );
}

 getData()
  .then(data => {
    console.log('Data fetched successfully:', data);
  }
  )
  .catch(error => {
    console.error('Error fetching data:', error);
  })

  console.log('Fetching data...');