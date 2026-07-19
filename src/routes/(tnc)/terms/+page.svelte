<script>
	import { resolve } from '$app/paths';
	import { Particles } from '$lib/components/custom';
</script>

<svelte:head>
	<title>Terms & Conditions | MicroManus</title>
</svelte:head>

<Particles class="fixed top-0 -z-10 h-screen w-screen" />

<main class="mx-auto max-w-3xl p-6">
	<h1>Terms and Conditions</h1>

	<p><strong>Last updated:</strong> July 19, 2026</p>

	<p>
		Welcome to <strong>MicroManus</strong> (the “Service”), a collaborative Kanban board application
		accessible at <a href={resolve('/')}>https://micromanus.tsuzat.com</a>. By accessing or using
		MicroManus (via our website or app), you agree to these Terms and Conditions (“Terms”). If you
		do not agree with any part of these Terms, please do not use our Service. These Terms
		incorporate by reference our Privacy Policy and any future modifications thereto.
	</p>

	<h2>Eligibility</h2>
	<ul>
		<li>
			You must be <strong>at least 13 years old</strong> to use MicroManus. By using the Service, you
			represent and warrant that you are 13 or older. Persons under 13 are not permitted to use the Service.
		</li>
		<li>
			If you are over 13 but under 18 (in many jurisdictions the age of majority), you must have
			permission from a parent or legal guardian to use MicroManus. By consenting, the parent or
			guardian takes full responsibility for the minor's online conduct and compliance with these
			Terms.
		</li>
	</ul>

	<h2>Account Registration</h2>
	<ul>
		<li>
			To access MicroManus’s features, you may need to register for an account using a valid email
			address. You agree to provide accurate and current information and keep your password secure.
			You are responsible for all activities that occur under your account.
		</li>
		<li>
			You agree not to share your login credentials or allow anyone else to access your account.
			MicroManus reserves the right to suspend or terminate accounts if we detect unauthorized or
			fraudulent use.
		</li>
	</ul>

	<h2>Subscription Plans</h2>
	<ul>
		<li>
			MicroManus offers a <strong>free plan</strong> and a <strong>Pro (paid) plan</strong>. On the
			<strong>Free Plan</strong>, each user may create up to <strong>unlimited boards</strong>,
			<strong>unlimited sections</strong>, and <strong>unlimited cards</strong>. The free plan does
			<strong>not</strong> include tasks or realtime collaboration features.
		</li>
		<li>
			<strong>Pro Plan (Paid):</strong> Users can subscribe to our Pro plan to unlock additional
			features. Pro users enjoy
			<strong>unlimited boards, sections, cards, tasks, and collaboration</strong>, the ability to
			add a profile picture, and exclusive access to a Discord support channel. Details of current
			pricing and features are provided on our website. MicroManus may modify features and limits
			from time to time; the current limits described above apply unless we notify you otherwise.
		</li>
	</ul>

	<h2>Payments and Billing</h2>
	<ul>
		<li>
			<strong>Subscription Payments:</strong> Payments for Pro subscriptions are processed via
			<strong>Stripe</strong> through our payment partner <strong>Polar.sh</strong>. By choosing a
			paid plan, you authorize MicroManus (via the payment processor) to charge the applicable fees
			to your chosen payment method. You agree to pay all fees and applicable taxes associated with
			your subscription.
		</li>
		<li>
			<strong>Recurring Billing:</strong> Pro subscriptions automatically renew at the end of each billing
			period. We will automatically charge your payment method for the recurring subscription fee until
			you cancel. If you do not want to continue the service, you must cancel before your next billing
			date through your MicroManus account settings. Cancelling stops further charges, but you will retain
			Pro access until the end of your current paid term.
		</li>
		<li>
			<strong>Refunds:</strong> Subscription fees are generally <strong>non-refundable</strong>. For
			example, if you cancel your Pro subscription, you may continue to use Pro features until the
			end of your paid period, but you will <strong>not</strong> receive a prorated refund for any unused
			time. Except as required by law or as expressly provided herein, MicroManus will not refund any
			fees that have already been paid.
		</li>
		<li>
			<strong>Payment Processor Disclaimer:</strong> We use Stripe (via Polar.sh) to process payments.
			You acknowledge that any issues or errors in payment processing (e.g. failed transactions, duplicate
			charges) are outside our control. As Polar's terms state, “we use Stripe, Inc. as our Payment Processor”
			and we are not liable for any errors by the payment processor. Any billing disputes should be addressed
			in accordance with the payment processor's dispute resolution procedures.
		</li>
	</ul>

	<p class="mt-8">
		If you have any questions about these Terms, please contact us at
		<strong><a href="mailto:contact@tsuzat.com">contact@tsuzat.com</a></strong>.
	</p>
</main>

<style>
	p {
		color: var(--color-muted-foreground);
	}

	li {
		color: var(--color-muted-foreground);
		margin: 0.5rem;
	}
	li {
		margin-left: 1.5rem;
		list-style: disc !important;
	}

	li > strong:first-child {
		text-decoration: underline;
	}

	strong {
		color: var(--color-foreground);
		font-weight: 500;
	}

	a {
		color: var(--color-primary);
		text-decoration: underline;
		z-index: 50 !important;
	}
</style>
