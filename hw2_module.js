function update(dt) {

	keyboard.update();
	
	if (vel.length() > 0) {
		angle = 1.5*Math.PI + Math.atan2(vel.x, vel.z);
	}

	if (keyboard.pressed("space"))  
		power = 0.01;               
	if (keyboard.pressed("up"))  
		power += 1.4;        
	if (keyboard.pressed("down"))  
		power -= 1.4;   
	  
	var angle_thrust = angle;
	if (keyboard.pressed("left"))
		angle_thrust += 0.5;
	if (keyboard.pressed("right"))
		angle_thrust -= 0.5;
		
	//無power = Math.clamp(power, 0.0, 80.0); 
	if (power <= -60.0)
		power = -60.0;
	if (power >= 60.0)	
		power = 60.0;
	
	// compute force (Go forward)
	if (power >= 0.00) {
		var thrust = new THREE.Vector3(1,0,0).multiplyScalar(power).applyAxisAngle(new THREE.Vector3(0,1,0), angle_thrust);
		force.copy (thrust);
		force.add(vel.clone().multiplyScalar(-2));

	// eulers
		vel.add(force.clone().multiplyScalar(dt));
		pos.add(vel.clone().multiplyScalar(dt));
	}
	
	// compute force (Go back)
	if (power <= -0.00) {
		var thrust = new THREE.Vector3(1,0,0).multiplyScalar(-power).applyAxisAngle(new THREE.Vector3(0,1,0), angle_thrust);
		force.copy (thrust);
		force.add(vel.clone().multiplyScalar(-2));

	// eulers
		vel.add(force.clone().multiplyScalar(dt));
		pos.add(vel.clone().multiplyScalar(-dt));
	}
}

function makeBoundary(car) {

	var boundary = {};
	boundary.max = car.localToWorld(new THREE.Vector3(7.5, 0, 5));
	boundary.min = car.localToWorld(new THREE.Vector3(-7.5, 0, -5));
	boundary.px = car.localToWorld(new THREE.Vector3(0.7, 0, 0)).sub(car.position);//???
	return boundary;
}

function Check_Intersect(Bound, Cyli, Rad) {

	const Rad2 = Rad * Rad;

	let xHat = Bound.px;
	let zHat = xHat.clone().cross(new THREE.Vector3(0,1,0)).normalize();

	let R = {max:{x:0, z:0}, min:{x:0, z:0}};
	let cp = Bound.max.clone().sub(Cyli.position);   
	R.max.x = cp.dot(xHat), R.max.z = cp.dot(zHat);

	cp = Bound.min.clone().sub(Cyli.position);
	R.min.x = cp.dot(xHat), R.min.z = cp.dot(zHat);

	if (R.max.x < 0) 		/* R to left of circle center */{
		if (R.max.z < 0)	/* R in lower left corner */{
			return ((R.max.x * R.max.x + R.max.z * R.max.z) < Rad2);
		}else if (R.min.z > 0) 	/* R in upper left corner */{
			return ((R.max.x * R.max.x + R.min.z * R.min.z) < Rad2);
		}else 					/* R due West of circle */{
			return(Math.abs(R.max.x) < Rad);
		}
	}else if (R.min.x > 0)  	/* R to right of circle center */{
		if (R.max.z < 0) 	/* R in lower right corner */	{
			return ((R.min.x * R.min.x + R.max.z * R.max.z) < Rad2);
		}else if (R.min.z > 0)  	/* R in upper right corner */{
			return ((R.min.x * R.min.x + R.min.z * R.min.z) < Rad2);
		}else 				/* R due East of circle */{
			return (R.min.x < Rad);
		}		
	}else				/* R on circle vertical centerline */{
		if (R.max.z < 0) 	/* R due South of circle */{
			return (Math.abs(R.max.z) < Rad);
		}else if (R.min.z > 0)  	/* R due North of circle */{
			return (R.min.z < Rad);
		}else 				/* R contains circle centerpoint */{
			return(true);	
		}		
	}	
}