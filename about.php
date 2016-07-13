<!DOCTYPE html>
<html lang="en">

	<head>
		<title>About</title>
		<meta charset="utf-8">
		<link rel="stylesheet" href="css/app.css">
	</head>

	<body data-section="about">

		<div id="content">

			<div class="fragment-wrapper" id="page-header">
				<div class="fragment">
					<h1>About</h1>
				</div>
			</div>

			<div class="fragment-wrapper" id="boxes">
				<div class="fragment">
					<a class="box" href="saydnaya.php">
						<img src="assets/placeholder-360x230.jpg"/>
						<div class="info">
							<h2>Saydnaya</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
						</div>
					</a>
					<a class="box" href="detention-in-syria.php">
						<img src="assets/placeholder-360x230.jpg"/>
						<div class="info">
							<h2>Detention in Syria</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
						</div>
					</a>
					<a class="box" href="making-of.php">
						<img src="assets/placeholder-360x230.jpg"/>
						<div class="info">
							<h2>Making Of</h2>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
						</div>
					</a>
				</div>
			</div>

			<?php include 'includes/fragment-report.php';?>

			<?php include 'includes/fragment-footer.php';?>

		</div>

		<?php include 'includes/fragment-header.php';?>

		<!-- Scripts -->

		<script src="js/lib/jquery-3.0.0.min.js"></script>
		<script src="js/lib/jquery.transit.min.js"></script>
		<script src="js/lib/player.min.js"></script>
		<script src="js/header.js"></script>

	</body>

</html>
