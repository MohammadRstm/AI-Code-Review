import { postaskAiAsText, } from "./getpostscript";

// class senddate{
//     constructor(filename,code,language){
//         this.filename=filename;
//         this.code=code;
//         this.language=language;
//     }

// }

//const case1 =new senddate(null,"def process_users(users):\n    for user in users:  # correct loop\n        print(user['name']  # missing closing parenthesis\n        if user['age'] > 18\n            print('Adult')  # missing colon\n        else\n            print('Minor')\n    data = []\n    for i in range(len(users)+1):  # off-by-one error\n        data[i] = users[i]  # index assignment error\n    return data\n\nresult = process_users('not a list')  # passing string instead of list",null);
// const case2=new senddate(null,"x = 5\nif x = 5:  # assignment instead of comparison\n    print('x is five')\nelse\n    print('x is not five'  # missing closing parenthesis"
// ,null);
// const case3=new senddate(null,"numbers = [1,2,3,4,5]\nsum = 0\nfor i in range(len(numbers)):  # using index unnecessarily\n    sum += numbers[i]\nprint('Sum:', sum)"
// ,null);
// const case4=new senddate(null,"def add_numbers(a, b):\n    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):\n        raise ValueError('Both inputs must be numbers')\n    return a + b\n\ntry:\n    result = add_numbers(5, 10)\n    print('Result:', result)\nexcept Exception as e:\n    print('Error:', e)"
// ,null);
// const case5=new senddate(null,   "def is_even(n):\n    if n % 2 == 1:\n        return True  # logic is wrong, should return False\n    return False\n\nprint(is_even(4))  # returns False incorrectly"
// ,null)
// const case6=new senddate(null,null,null);
// const case7 =new senddate(null,"",null);


// const cases=[case1,case2,case3,case4,case5,case6,case7]
const checkcase="def process_users(users):\n    for user in users:  # correct loop\n        print(user['name']  # missing closing parenthesis\n        if user['age'] > 18\n            print('Adult')  # missing colon\n        else\n            print('Minor')\n    data = []\n    for i in range(len(users)+1):  # off-by-one error\n        data[i] = users[i]  # index assignment error\n    return data\n\nresult = process_users('not a list')  # passing string instead of list";
async function testing(url){
   try{
    const [isdopostaskAiAsText,validatelist,errorlist,message]=await postaskAiAsText(url,checkcase);
    if(!isdopostaskAiAsText){
        console.error(message)
        return;
    }
    if(count(validatelist)>0){
        validatelist.forEach(element => {
            console.log(element);
        });
    }
    if(count(errorlist)>0){
        errorlist.forEach(element =>{
            console.log(element);
        })
    }
}catch(error){
    console.log(error)
}}

testing();