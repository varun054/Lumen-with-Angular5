<?php
// ItemController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use App\Blog;
use App\BlogSubscription;

class BlogController extends Controller{


    /**
     * storing data for blogs
     * rajshree.tathe@smartdatainc.net
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
    */

    public function createBlog(Request $request)
    {

        
        $filename = null;
        $tempimgname = null;
        $isVedio = 0;
        if(@$request->file('fileKey')){
            $image = $request->file('fileKey');

            $tempimgname = time().'.'.$image->getClientOriginalExtension();

            if($image->getClientOriginalExtension() == "mp4"){
                $isVedio = 1;
            }

            $filename = $image->getClientOriginalName();



            $destinationPath = base_path('public/images');

            $image->move($destinationPath, $tempimgname);
        }
      
        $data = $request->request->get('formId');
        //return($isVedio);
        if($data != null){
            $datablog['title'] = $request['title'];
            $datablog['description'] = $request['description'];
            $datablog['image_url'] = $filename;
            $datablog['is_vedio'] = $isVedio;
            $alredyExistUrl = $request->request->get('temp_url');
            //var_dump($alredyExistUrl);
            if($alredyExistUrl != '' && $alredyExistUrl != null && !$request->file('fileKey')){
                $datablog['temp_image_url'] = $alredyExistUrl;    
            } else {
                Blog::find($request['formId']); 
                $datablog['temp_image_url'] = $tempimgname;
            }
            $blog = Blog::whereId($request['formId'])->update($datablog);
            return response()->json(['message' => 'Successfully added','status' => "200","data" =>  $blog]);
        } else {
            $datablog['title'] = $request['title'];
            $datablog['description'] = $request['description'];
            $datablog['image_url'] = $filename;
            $datablog['is_vedio'] = $isVedio;
            $datablog['temp_image_url'] = $tempimgname;
            $blog = Blog::create($datablog);
            return response()->json(['message' => 'Successfully added','status' => "200","data" =>  $blog]);
        }
       
    }

    /**
     * Subscribe users for blogs
     * rajshree.tathe@smartdatainc.net
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
    */

    public function SubscribeBlogs(Request $request)
    {
        
        $blogData =  BlogSubscription::where('email', $request->data['email'])->first(); 
        //return response()->json($blogData);
        if(empty($blogData)){
            $datablog['email'] = $request->data['email'];
            $datablog['blog_id'] = $request->id;
            $blog = BlogSubscription::create($datablog);
            return response()->json(['message' => 'SuccessfullyAdded','status' => "200","data" =>  $blog]);
        } else{
             return response()->json(['message' => 'AlreadyExist','status' => 401]);
        }
       
    }

    /**
     * Fetch data list for blogs
     *
     * @param  
     * @return \Illuminate\Http\Response
    */

    public function getBlogs(){

        $blogs  = Blog::orderBy('created_at', 'desc')->paginate(10);

        return response()->json($blogs);

    }

    /**
     * Fetch blog details
     *
     * @param  $id 
     * @return \Illuminate\Http\Response
    */

    public function blogDetail($id){

        $blog  = Blog::find($id);
        //$blog['image_blog'] = base_path('public/images/').$blog['temp_image_url'];
        return response()->json($blog);
    }

    /**
     * Fetch blog details
     *
     * @param  $id 
     * @return \Illuminate\Http\Response
    */
    public function deleteBlog($id){
        $article  = Blog::find($id);

        $article->delete();

        return response()->json('success');
    }

    public function fileUpload(Request $request)

    {

        $this->validate($request, [

            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

        ]);


        $image = $request->file('image');

        $input['imagename'] = time().'.'.$image->getClientOriginalExtension();

        /*$destinationPath = public_path('/images');

        $image->move($destinationPath, $input['imagename']);*/


        //$this->postImage->add($input);

        var_dump($image);
        //return back()->with($input);

    }


}

