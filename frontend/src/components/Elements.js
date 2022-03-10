function Button(props){
return (
    <div className="bg-secondary text-accent-2 text-xl inline-block p-2 rounded-md pl-10 pr-10 mt-auto mb-auto font-black cursor-pointer m-5 shadow-md hover:shadow-xl" {...props}>{props.children}</div>
)
}
export {Button};