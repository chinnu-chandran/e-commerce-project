const sum = (a,b) => {
    if(a && b) {

        return a+b ;
    }
    throw new Error ('invalid argument')
};
try {

    console.log(sum(2))
}
catch (err) {
    console.log('error occured');
    console.log(err)
}

