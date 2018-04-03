import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import {	NgForm,  
			FormGroup,
  			FormBuilder,
  			Validators,
  			FormControl 
  		}   from '@angular/forms';
import { Globals } from './../globals';
import { PermissionService } from './../permission.service';
import { ConfirmationService } from '@jaspero/ng2-confirmations';
import { ResolveEmit } from '../interface/resolve-emit';
import { ConfirmSettings } from '../interface/confirm-settings';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

interface bloghistory {
  title: string,
  formId: number,
  description:string,
  temp_url: string,
  temp_image_url:string,
  id:number
}

interface datahistroy {
	data: any,
	total: number
}


@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

	blogform: FormGroup;
	baseurl='';
	imgUrl='';
	filename:boolean = false;
	display='none';
	Viewdisplay = 'none';
	blogData: any = [];
	blog_title:string = 'Create New Blog';
	formId:number = 0;
	fileToUpload: File = null;
	public updated = false;
	submitText:string = '';
	fileError = false;
	temp_url:string = '';
	blogDetail: any = "";
	fileExtension:string;
	contentValue:any=false;
	//SuccessDisplay = 'none';
	perpage:number = 10;
	totalBlogs:any;
	p: number = 1;
	 permission:any;
	placements: string[] = ['top', 'left', 'right', 'bottom'];
	popoverTitle: string = 'Confirmation!!';
  	popoverMessage: string = 'Are you really <b>sure</b> you want to delete this blog?';
  	confirmClicked: boolean = false;
  	cancelClicked: boolean = false;
	settings: ConfirmSettings | any = {
	    overlay: true,
	    overlayClickToClose: true,
	    showCloseButton: true,
	    confirmText: 'Yes',
	    declineText: 'No'
  };

	

	constructor(
		private http: HttpClient, 
		private formBuilder: FormBuilder,
		private globals: Globals,
		private _confirmation: ConfirmationService,
		private permissionService: PermissionService
	) {
		this.baseurl = globals.baseurl;
		this.imgUrl = globals.ImageUrl;
      	console.log(this.baseurl);
	}

	ngOnInit() {

		this.permission = this.permissionService.checkRoute();

		 this.blogform = this.formBuilder.group({
	      title: [null, Validators.required],
	      description: [null, Validators.required],
	    });

	   this.getBlogData(this.p);
	}

	getBlogData(pageNumber){
	    this.http.get<datahistroy>(this.baseurl+'/get_blogs?page='+pageNumber).subscribe(data => {
	      this.blogData = data.data;
	      this.totalBlogs = data.total;
	   });
	}

	pageChanged(event){
		 this.p = event;
		 this.getBlogData(event);
	}

	getBlog(id) {
	    this.http.get<bloghistory>(this.baseurl+'/blog/'+id).subscribe(data => {
	    	console.log(data);
	    	/*this.title = data.title;*/
	    	this.blogDetail = data;
	    	this.blogform = this.formBuilder.group({
		      title: data.title,
		      description: data.description,
		      formId:data.id,
		      temp_url:data.temp_image_url
		    });
		    /* this.blogform.patchValue({
	            title: data.title,
		      	description: data.description,
		      	formId:data.id,
		      	temp_url:data.temp_image_url
       		 });*/
	      //this.formId = data.id;
	    });
	}

	handleFileInput(files: FileList) {
	    this.fileToUpload = files.item(0);
	    console.log(this.fileToUpload);
	    var allowedExtensions = 
       	["jpg","jpeg","png","JPG","JPEG","JFIF","BMP","SVG","mp4"];
    	this.fileExtension = this.fileToUpload.name.split('.').pop();
    	if(this.isInArray(allowedExtensions, this.fileExtension)) {
	       this.fileError = false;
	    } else {
	      this.fileError = true;
	    }	
	}

	isInArray(array, word) {
	    return array.indexOf(word.toLowerCase()) > -1;
	}

	deleteBlog(id){
		 /*this._confirmation.create('Confirm', 'Are you sure, you want to delete this blog?', this.settings)
        .subscribe((ans: ResolveEmit) => {
          if (ans.resolved == true) {*/
          	  this.confirmClicked = true;
              this.http.get(this.baseurl+'/deleteBlog/'+id).subscribe(data => {
		      this.getBlogData(this.p);
		      this.confirmClicked = false;
		      //this.SuccessDisplay = 'block';

		    /*});
          } else {
            console.log('decline button clicked');
          }*/
       });
	}	

	openModal(modalName, id){
		console.log(id);
		if(id != undefined && id != 'add'){
			this.blog_title = 'Edit Blog';
			this.submitText = 'Edit';
			this.filename = true;
			this.getBlog(id);
		} else {
			this.blogform.reset();
			this.formId = 0;
			this.blog_title = 'Create New Blog';
			this.submitText = 'Add';
		}

       this[modalName]='block'; 
    }

    onCloseHandled(modalName){
       this[modalName]='none'; 
    }

	onSubmit(value: any){
	  	console.log('you submitted value: ', value); 
	  	console.log(this.fileError);
	  	 if (this.blogform.invalid || this.fileError) {
	  	 	Object.keys(this.blogform.controls).forEach((formControl: any) => {
		        this.blogform.controls[formControl].markAsDirty()
		     })
	  	 } else {	
	  	 	const formData = new FormData();
	  	 	console.log('this.fileToUpload',this.fileToUpload)
		   
		    console.log(formData);
		    console.log(value);
		    for (var property in value) {
	          if (value.hasOwnProperty(property)) {
	              formData.append(property, value[property]);
	          }
		    }
		   
		   	formData.append('fileKey', this.fileToUpload);

			let head = new HttpHeaders({ 'Content-Type': this.contentValue });
	  	 	const req = this.http.post(this.baseurl+'/add_blogs', formData, {headers: head})
		  	.subscribe(
		        res => {
		          this.updated = true;
		          setTimeout(()=>{    //<<<---    using ()=> syntax
				      this.display='none'; 
				      this.updated = false;
				 },3000);
		          this.blogform.reset();
		          this.getBlogData(this.p);
		        },
		        err => {
		          console.log("Error occured");
		        }
		  	);
	  	 }
	}

}
