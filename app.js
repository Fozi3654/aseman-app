// Aseman Airline App — mobile-first SPA
(function(){
'use strict';

var destinations=[
 {id:'paris',name:'پاریس',country:'فرانسه',img:'assets/paris.webp',price:62500000,desc:'پایتخت عشق، هنر و مد'},
 {id:'istanbul',name:'استانبول',country:'ترکیه',img:'assets/istanbul.webp',price:18900000,desc:'دروازهٔ شرق و غرب'},
 {id:'tokyo',name:'توکیو',country:'ژاپن',img:'assets/tokyo.webp',price:78200000,desc:'شهر نئون و سنت'},
 {id:'london',name:'لندن',country:'انگلستان',img:'assets/london.webp',price:58700000,desc:'بریتانیای کلاسیک'},
 {id:'dubai',name:'دبی',country:'امارات',img:'assets/dubai.webp',price:14500000,desc:'خرید و برج‌های آسمان‌خراش'},
 {id:'maldives',name:'مالدیو',country:'جزیره',img:'assets/maldives.webp',price:85900000,desc:'بهشت ساحلی اقیانوس'}
];

var cities=['تهران','مشهد','شیراز','اصفهان','تبریز','کیش','پاریس','استانبول','توکیو','لندن','دبی','مالدیو','دوبی','آنتالیا','بانکوک'];

var airlines=[
 {code:'IR',name:'ایران‌ایر',color:'#1E66F5'},
 {code:'W5',name:'ماهان',color:'#D6336C'},
 {code:'EP',name:'آسمان',color:'#269FE8'},
 {code:'B9',name:'کاسپین',color:'#10B981'},
 {code:'QR',name:'قطر ایرویز',color:'#8B5CF6'}
];

// ---- State & Storage ----
var storage={
  get:function(k){try{return localStorage.getItem(k);}catch(e){return null;}},
  set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}},
  del:function(k){try{localStorage.removeItem(k);}catch(e){}}
};

var state={
  tab:'home',
  trip:'oneway',
  from:'تهران',
  to:'استانبول',
  date:'۱۴۰۵/۰۹/۱۵',
  pax:1,
  flight:null,
  seat:null,
  booking:{name:'',family:'',national:'',phone:''},
  authMode:'login',
  authPhone:'',
  authStep:'phone'
};

var user=null;
try{user=JSON.parse(storage.get('as_user')||'null');}catch(e){user=null;}

var tickets=[];
try{tickets=JSON.parse(storage.get('as_tickets')||'[]');}catch(e){tickets=[];}

// ---- Utils ----
function $(s){return document.querySelector(s);}
function fmt(n){return n.toLocaleString('fa-IR');}
function fmtPrice(n){return fmt(n)+' تومان';}
function faDigit(s){var m={'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};return String(s).replace(/[0-9]/g,function(d){return m[d];});}
function enDigit(s){var m={'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'};return String(s).replace(/[۰-۹]/g,function(d){return m[d];});}
function randCode(n){var c='';for(var i=0;i<n;i++)c+=Math.floor(Math.random()*10);return c;}
function randTime(){var h=Math.floor(Math.random()*24);var m=Math.random()<.5?'۰۰':'۳۰';return faDigit((h<10?'0':'')+h+':')+m;}
function addHours(hhmm,hours){var p=enDigit(hhmm).split(':');var t=parseInt(p[0])*60+parseInt(p[1])+hours*60;t=t%(24*60);var h=Math.floor(t/60);return faDigit((h<10?'0':'')+h+':')+(t%60===0?'۰۰':'۳۰');}

function toast(msg){
  var t=document.createElement('div');
  t.className='toast';t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){t.classList.add('show');},10);
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},400);},2500);
}

// ---- Router ----
function go(tab){
  state.tab=tab;
  if(tab==='profile'&&!user){state.tab='auth';}
  document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===state.tab||(state.tab==='auth'&&b.dataset.tab==='profile')||(state.tab==='results'&&b.dataset.tab==='search')||(state.tab==='booking'&&b.dataset.tab==='search')||(state.tab==='confirm'&&b.dataset.tab==='search'));});
  render();
}

// ---- Screens ----
function viewHome(){
  var greet=user?('سلام '+user.name+' 👋'):'سلام مسافر 👋';
  var initial=user?user.name.charAt(0):'م';
  return '<div class="screen">'+
   '<div class="hero-home">'+
     '<div class="hello"><div><h3>'+greet+'</h3><b>سفر بعدی‌ت کجاست؟</b></div><div class="hello-avatar">'+initial+'</div></div>'+
     searchCardHTML()+
   '</div>'+
   '<div class="section">'+
     '<div class="section-head"><h2>مقاصد محبوب</h2><a href="#" onclick="A.go(\'offers\');return false">همه</a></div>'+
     '<div class="dest-scroll">'+destinations.map(function(d){return '<div class="dest-card" onclick="A.searchTo(\''+d.name+'\')">'+
       '<img src="'+d.img+'" alt="'+d.name+'" loading="lazy">'+
       '<div class="dest-card-price">از '+faDigit(Math.round(d.price/1e6))+' میلیون</div>'+
       '<div class="dest-card-body"><h4>'+d.name+'</h4><p>'+d.country+'</p></div>'+
     '</div>';}).join('')+'</div>'+
   '</div>'+
   '<div class="section">'+
     '<div class="section-head"><h2>پیشنهادهای ویژه</h2><a href="#" onclick="A.go(\'offers\');return false">همه</a></div>'+
     '<div class="offers-grid">'+
       '<div class="offer-card" onclick="A.searchTo(\'دبی\')"><div class="offer-img" style="background-image:url(assets/dubai.webp)"></div><div class="offer-card-body"><h4>دبی ۳ شب</h4><p>پرواز + هتل ۴ ستاره</p></div><span class="offer-badge">۳۰٪ تخفیف</span></div>'+
       '<div class="offer-card" onclick="A.searchTo(\'آنتالیا\')"><div class="offer-img" style="background-image:url(assets/maldives.webp)"></div><div class="offer-card-body"><h4>تور ترکیبی آنتالیا</h4><p>۶ شب اقامت ساحلی</p></div><span class="offer-badge">پیشنهاد روز</span></div>'+
     '</div>'+
   '</div>'+
   '<div class="spacer"></div>'+
  '</div>';
}

function searchCardHTML(){
  return '<div class="search-card">'+
    '<div class="trip-switch">'+
      '<button class="'+(state.trip==='oneway'?'active':'')+'" onclick="A.trip(\'oneway\')">یک‌طرفه</button>'+
      '<button class="'+(state.trip==='round'?'active':'')+'" onclick="A.trip(\'round\')">رفت و برگشت</button>'+
    '</div>'+
    '<div class="cities-wrap">'+
      '<div class="input-group"><div class="ig-icon">✈️</div><div style="flex:1"><label>مبدأ</label><input id="fromInp" value="'+state.from+'" list="citiesList" oninput="state.from=this.value"></div></div>'+
      '<div class="swap-cities" onclick="A.swap()"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/></svg></div>'+
      '<div class="input-group"><div class="ig-icon">🛬</div><div style="flex:1"><label>مقصد</label><input id="toInp" value="'+state.to+'" list="citiesList" oninput="state.to=this.value"></div></div>'+
    '</div>'+
    '<datalist id="citiesList">'+cities.map(function(c){return '<option value="'+c+'">';}).join('')+'</datalist>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">'+
      '<div class="input-group"><div style="flex:1"><label>تاریخ</label><input value="'+state.date+'" oninput="state.date=this.value"></div></div>'+
      '<div class="input-group"><div style="flex:1"><label>مسافر</label><select onchange="state.pax=parseInt(this.value)">'+
        [1,2,3,4,5].map(function(n){return '<option value="'+n+'"'+(state.pax===n?' selected':'')+'>'+faDigit(n)+' نفر</option>';}).join('')+
      '</select></div></div>'+
    '</div>'+
    '<button class="btn" style="margin-top:14px" onclick="A.search()">جست‌وجوی پرواز 🔍</button>'+
  '</div>';
}

function viewSearch(){
  return '<div class="screen"><div style="padding-top:14px">'+searchCardHTML()+'</div></div>';
}

function viewResults(){
  var flights=generateFlights();
  return '<div class="screen">'+
    '<div class="back-bar"><button onclick="A.go(\'home\')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></button><h1>'+state.from+' → '+state.to+'</h1></div>'+
    '<div style="color:var(--muted);font-size:12px;margin-bottom:12px">'+faDigit(flights.length)+' پرواز • '+state.date+' • '+faDigit(state.pax)+' مسافر</div>'+
    '<div class="filters">'+
      '<button class="filter active">همه</button>'+
      '<button class="filter">ارزان‌ترین</button>'+
      '<button class="filter">سریع‌ترین</button>'+
      '<button class="filter">صبح</button>'+
      '<button class="filter">عصر</button>'+
      '<button class="filter">بدون توقف</button>'+
    '</div>'+
    '<div class="flight-list">'+flights.map(function(f,i){return flightCard(f,i);}).join('')+'</div>'+
    '<div class="spacer"></div>'+
  '</div>';
}

function flightCard(f,i){
  return '<div class="flight-card" onclick="A.selectFlight('+i+')">'+
    '<div class="fc-top">'+
      '<div class="airline"><div class="airline-logo" style="background:'+f.airline.color+'">'+f.airline.code+'</div><div><div class="airline-name">'+f.airline.name+'</div><div style="font-size:10.5px;color:var(--muted)">'+f.class+'</div></div></div>'+
      '<div class="price">'+fmtPrice(f.price)+'</div>'+
    '</div>'+
    '<div class="route-visual">'+
      '<div class="route-time"><b>'+f.depart+'</b><span>'+state.from+'</span></div>'+
      '<div class="route-line"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 14l-7-7v4L4 11v4l10 1v4z"/></svg><span>'+f.duration+'</span></div>'+
      '<div class="route-time"><b>'+f.arrive+'</b><span>'+state.to+'</span></div>'+
    '</div>'+
  '</div>';
}

function generateFlights(){
  var seed=(state.from+state.to).length;
  var destData=destinations.find(function(d){return d.name===state.to;});
  var basePrice=destData?destData.price:20000000;
  var flights=[];
  for(var i=0;i<5;i++){
    var al=airlines[(seed+i)%airlines.length];
    var dep=randTime();
    var dur=(2+((seed+i)%5))+' ساعت '+((i*17)%60)+'دقیقه';
    flights.push({
      airline:al,
      depart:dep,
      arrive:addHours(dep,2+((seed+i)%5)),
      duration:faDigit(dur),
      price:basePrice+i*2000000-2000000,
      class:i%2===0?'اکونومی':'بیزینس'
    });
  }
  return flights;
}

function viewBooking(){
  var f=state.flight;
  if(!f){state.tab='home';return viewHome();}
  var seats=[];
  var takenSeats=['3A','3B','4C','5F','6A','6B','7D','8E','9A'];
  var rows=10;
  for(var r=1;r<=rows;r++){
    for(var c=0;c<6;c++){
      var letter='ABCDEF'[c];
      var id=r+letter;
      seats.push({id:id,row:r,col:c,taken:takenSeats.indexOf(id)>-1});
    }
  }
  var seatHTML='<div class="seat-grid">';
  seats.forEach(function(s,i){
    if(s.col===3){seatHTML+='<div class="aisle">'+faDigit(s.row)+'</div>';}
    var cls='seat'+(s.taken?' taken':'')+(state.seat===s.id?' selected':'');
    seatHTML+='<button class="'+cls+'" onclick="A.pickSeat(\''+s.id+'\')" '+(s.taken?'disabled':'')+'>'+s.id+'</button>';
  });
  seatHTML+='</div>';

  return '<div class="screen">'+
    '<div class="back-bar"><button onclick="A.go(\'results\')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></button><h1>تکمیل رزرو</h1></div>'+

    '<div class="sect-card">'+
      '<h3>خلاصه پرواز</h3>'+
      '<div class="row" style="justify-content:space-between">'+
        '<div class="airline"><div class="airline-logo" style="background:'+f.airline.color+'">'+f.airline.code+'</div><div><div class="airline-name">'+f.airline.name+'</div><div style="font-size:11px;color:var(--muted)">'+state.from+' → '+state.to+'</div></div></div>'+
        '<div style="text-align:center"><b style="font-size:16px">'+f.depart+'</b><div style="font-size:10.5px;color:var(--muted)">'+state.date+'</div></div>'+
      '</div>'+
    '</div>'+

    '<div class="sect-card">'+
      '<h3>اطلاعات مسافر</h3>'+
      '<div class="field-row">'+
        '<div class="field"><label>نام</label><input id="bk_name" value="'+state.booking.name+'" oninput="state.booking.name=this.value" placeholder="فاطمه"></div>'+
        '<div class="field"><label>نام خانوادگی</label><input id="bk_family" value="'+state.booking.family+'" oninput="state.booking.family=this.value" placeholder="احمدی"></div>'+
      '</div>'+
      '<div class="field"><label>کد ملی</label><input id="bk_nat" value="'+state.booking.national+'" oninput="state.booking.national=this.value" placeholder="۱۰ رقم" inputmode="numeric"></div>'+
      '<div class="field"><label>شماره موبایل</label><input id="bk_phone" value="'+state.booking.phone+'" oninput="state.booking.phone=this.value" placeholder="۰۹۱۲xxxxxxx" inputmode="tel"></div>'+
    '</div>'+

    '<div class="sect-card">'+
      '<h3>انتخاب صندلی</h3>'+
      seatHTML+
      '<div class="seat-legend"><span><span class="seat-dot"></span>آزاد</span><span><span class="seat-dot d-sel"></span>انتخاب شما</span><span><span class="seat-dot d-tak"></span>رزروشده</span></div>'+
    '</div>'+

    '<div class="sect-card">'+
      '<h3>اطلاعات پرداخت</h3>'+
      '<div class="notice-info">این یک اپ نمونه است؛ پرداخت واقعی انجام نمی‌شود. برای تست هر شماره‌ای وارد کنید.</div>'+
      '<div class="field" style="margin-top:12px"><label>شماره کارت</label><input value="۶۰۳۷ ۹۹۷۹ xxxx xxxx" inputmode="numeric"></div>'+
      '<div class="field-row">'+
        '<div class="field"><label>تاریخ انقضا</label><input value="۰۵/۰۷" placeholder="MM/YY"></div>'+
        '<div class="field"><label>CVV2</label><input value="xxx" inputmode="numeric"></div>'+
      '</div>'+
      '<div class="card-mock"><div class="cm-row"><span>Aseman Pay</span><span>VISA</span></div><div class="cm-number">۶۰۳۷ ۹۹۷۹ •••• ••••</div><div class="cm-row"><span>CARD HOLDER</span><span>EXPIRES '+(state.booking.name?state.booking.name.toUpperCase():'YOUR NAME')+'</span></div></div>'+
    '</div>'+

    '<div class="pay-total"><div><span style="font-size:12px;opacity:.85">مبلغ قابل پرداخت</span><b>'+fmtPrice(f.price*state.pax)+'</b></div><div style="font-size:11px;opacity:.85">'+faDigit(state.pax)+' مسافر</div></div>'+
    '<button class="btn" '+(canPay()?'':'disabled')+' onclick="A.pay()">'+(canPay()?'پرداخت و صدور بلیط':'ابتدا اطلاعات را کامل کنید')+'</button>'+
    '<div class="spacer"></div><div class="spacer"></div>'+
  '</div>';
}

function canPay(){
  var b=state.booking;
  return b.name&&b.family&&b.national&&b.phone&&state.seat;
}

function viewConfirm(){
  var t=state.lastTicket;
  if(!t){state.tab='home';return viewHome();}
  return '<div class="screen">'+
    '<div class="confirm">'+
      '<div class="check-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'+
      '<h1>بلیط شما صادر شد</h1>'+
      '<p>بلیط در «بلیط‌های من» ذخیره شد و پیامک تاییدیه ارسال خواهد شد.</p>'+
      ticketHTML(t,true)+
      '<div class="row" style="gap:10px;margin-top:16px">'+
        '<button class="btn ghost" onclick="A.go(\'tickets\')">بلیط‌های من</button>'+
        '<button class="btn" onclick="A.go(\'home\')">خانه</button>'+
      '</div>'+
      '<div class="spacer"></div>'+
    '</div>'+
  '</div>';
}

function ticketHTML(t,withQR){
  return '<div class="ticket">'+
    '<div class="ticket-top">'+
      '<div class="ticket-airline"><div class="airline"><div class="airline-logo" style="background:rgba(255,255,255,.2);color:#fff">'+t.airline.code+'</div><div><div style="font-size:14px;font-weight:700">'+t.airline.name+'</div><div style="font-size:11px;opacity:.85">شماره بلیط: '+t.code+'</div></div></div></div>'+
      '<div class="ticket-route">'+
        '<div class="tr-city"><b>'+t.from+'</b><span>'+t.depart+'</span></div>'+
        '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M21 14l-7-7v4L4 11v4l10 1v4z"/></svg>'+
        '<div class="tr-city"><b>'+t.to+'</b><span>'+t.arrive+'</span></div>'+
      '</div>'+
    '</div>'+
    '<div class="ticket-divider"></div>'+
    '<div class="ticket-body">'+
      '<div class="tb-grid">'+
        '<div><span>مسافر</span><b>'+t.passenger+'</b></div>'+
        '<div><span>تاریخ</span><b>'+t.date+'</b></div>'+
        '<div><span>صندلی</span><b>'+t.seat+'</b></div>'+
        '<div><span>کلاس</span><b>'+t.class+'</b></div>'+
      '</div>'+
      (withQR?'<div class="qr"></div><p style="text-align:center;font-size:11px;color:var(--muted)">کد را در فرودگاه اسکن کنید</p>':'')+
    '</div>'+
  '</div>';
}

function viewTickets(){
  if(!tickets.length){
    return '<div class="screen">'+
      '<div class="back-bar"><h1>بلیط‌های من</h1></div>'+
      '<div class="empty">'+
        '<div class="empty-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4v-2z"/></svg></div>'+
        '<h2>هنوز بلیطی ندارید</h2><p>اولین سفرتان را رزرو کنید.</p>'+
        '<button class="btn ghost" style="max-width:220px;margin:18px auto 0" onclick="A.go(\'home\')">رزرو پرواز</button>'+
      '</div>'+
    '</div>';
  }
  return '<div class="screen">'+
    '<div class="back-bar"><h1>بلیط‌های من ('+faDigit(tickets.length)+')</h1></div>'+
    tickets.map(function(t){return '<div class="ticket-list-item" onclick="A.showTicket(\''+t.code+'\')">'+
      '<div class="tli-status"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 14l-7-7v4L4 11v4l10 1v4z"/></svg></div>'+
      '<div class="tli-info"><h4>'+t.from+' → '+t.to+'</h4><p>'+t.date+' • '+t.depart+' • '+t.passenger+'</p><span class="tli-code">'+t.code+'</span></div>'+
    '</div>';}).join('')+
    '<div class="spacer"></div>'+
  '</div>';
}

function viewOffers(){
  return '<div class="screen" style="padding-top:18px">'+
    '<div class="offer-banner">'+
      '<h2>تخفیف ویژهٔ پایان پاییز</h2>'+
      '<p>تا ۴۰٪ تخفیف برای تورهای خارجی<br>فرصت محدود — کد تخفیف: <b>SAFAR۱۴۰۵</b></p>'+
      '<span class="chip">🎁 اعتبار تا ۳ روز دیگر</span>'+
    '</div>'+
    destinations.slice(0,5).map(function(d,i){var off=[30,25,40,20,35][i];return '<div class="offer-tile" onclick="A.searchTo(\''+d.name+'\')">'+
      '<img src="'+d.img+'" alt="'+d.name+'" loading="lazy">'+
      '<div class="offer-tile-body"><h4>'+d.name+' • '+d.country+'</h4><p>'+d.desc+'</p><div class="ob-row"><div class="ob-price"><s>'+fmt(d.price)+'</s> <b>'+fmt(Math.round(d.price*(1-off/100)))+' ت</b></div><span class="offer-badge">'+faDigit(off)+'٪ تخفیف</span></div></div>'+
    '</div>';}).join('')+
    '<div class="spacer"></div>'+
  '</div>';
}

function viewProfile(){
  var initial=user.name.charAt(0);
  return '<div class="screen" style="padding-top:0">'+
    '<div class="profile-header">'+
      '<div class="profile-avatar">'+initial+'</div>'+
      '<h1>'+user.name+'</h1>'+
      '<p>'+user.phone+'</p>'+
    '</div>'+
    '<div class="profile-stats">'+
      '<div class="stat"><b>'+faDigit(tickets.length)+'</b><span>سفرها</span></div>'+
      '<div class="stat"><b>'+faDigit(user.miles||1250)+'</b><span>مایل جایزه</span></div>'+
      '<div class="stat"><b>طلایی</b><span>سطح کاربری</span></div>'+
    '</div>'+
    '<div class="menu-list">'+
      menuItem('👤','ویرایش پروفایل','نام، شماره موبایل','A.toastMsg(\'در حال توسعه\')')+
      menuItem('💳','روش‌های پرداخت','کارت‌ها و کیف پول','A.toastMsg(\'در حال توسعه\')')+
      menuItem('✈️','مسافران','افراد ذخیره‌شده','A.toastMsg(\'در حال توسعه\')')+
    '</div>'+
    '<div class="menu-list">'+
      menuItem('🔔','اعلان‌ها','پیشنهادها و تغییرات','A.toastMsg(\'در حال توسعه\')')+
      menuItem('❓','پشتیبانی','گفت‌وگو با ما','A.toastMsg(\'در حال توسعه\')')+
      menuItem('📄','قوانین و حریم خصوصی','','A.toastMsg(\'در حال توسعه\')')+
    '</div>'+
    '<button class="btn ghost" onclick="A.logout()">خروج از حساب</button>'+
    '<div class="spacer"></div>'+
  '</div>';
}

function menuItem(icon,title,sub,action){
  return '<div class="menu-item" onclick="'+action+'">'+
    '<div class="mi-icon" style="font-size:18px">'+icon+'</div>'+
    '<div class="mi-text"><b>'+title+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div>'+
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--muted)" stroke-width="2" style="transform:rotate(180deg)"><path d="M15 18l-6-6 6-6"/></svg>'+
  '</div>';
}

function viewAuth(){
  return '<div class="auth">'+
    '<div class="auth-head">'+
      '<div class="plane-icon">✈️</div>'+
      '<h1>'+(state.authMode==='login'?'ورود به حساب':'ایجاد حساب جدید')+'</h1>'+
      '<p>با آسمان‌آرا بلیط رزرو کنید، سفرهاتون رو مدیریت کنید<br>و از تخفیف‌های ویژه بهره‌مند بشید.</p>'+
    '</div>'+
    '<div class="auth-switch">'+
      '<button class="'+(state.authMode==='login'?'active':'')+'" onclick="A.authMode(\'login\')">ورود</button>'+
      '<button class="'+(state.authMode==='signup'?'active':'')+'" onclick="A.authMode(\'signup\')">ثبت‌نام</button>'+
    '</div>'+
    (state.authStep==='phone'
      ? '<div class="field"><label>شماره موبایل</label><input id="authPhone" value="'+state.authPhone+'" oninput="state.authPhone=this.value" placeholder="۰۹۱۲۳۴۵۶۷۸۹" inputmode="tel"></div>'+
        '<button class="btn" onclick="A.sendOTP()">دریافت کد تایید</button>'
      : '<div class="field"><label>کد ۵ رقمی ارسال‌شده به '+state.authPhone+'</label>'+
        '<div class="otp-grid">'+
          '<input maxlength="1" inputmode="numeric" value="۸">'+
          '<input maxlength="1" inputmode="numeric" value="۳">'+
          '<input maxlength="1" inputmode="numeric" value="۱">'+
          '<input maxlength="1" inputmode="numeric" value="۷">'+
          '<input maxlength="1" inputmode="numeric" value="۲">'+
        '</div></div>'+
        '<div class="notice-info">این اپ نمونه است. کد تستی به صورت خودکار پر شده.</div>'+
        '<button class="btn" style="margin-top:12px" onclick="A.verifyOTP()">تایید و ورود</button>'+
        '<button class="btn ghost" style="margin-top:8px" onclick="A.resetAuth()">تغییر شماره</button>'
    )+
    '<div style="text-align:center;color:var(--muted);font-size:11.5px;margin-top:20px">با ادامه، شما قوانین و حریم خصوصی آسمان‌آرا را می‌پذیرید.</div>'+
  '</div>';
}

// ---- Actions (window.A) ----
window.A={
  go:go,
  trip:function(t){state.trip=t;render();},
  swap:function(){var tmp=state.from;state.from=state.to;state.to=tmp;render();},
  search:function(){
    if(!state.from||!state.to){toast('مبدأ و مقصد را وارد کنید');return;}
    state.tab='results';render();
  },
  searchTo:function(city){
    state.to=city;
    if(state.from===city)state.from='تهران';
    state.tab='results';render();
  },
  selectFlight:function(i){
    state.flight=generateFlights()[i];
    state.seat=null;
    state.tab='booking';render();
  },
  pickSeat:function(id){state.seat=id;render();},
  pay:function(){
    if(!user){state.tab='auth';render();toast('ابتدا وارد حساب شوید');return;}
    if(!canPay()){toast('اطلاعات ناقص است');return;}
    var f=state.flight;
    var t={
      code:'AS-'+randCode(6),
      airline:f.airline,
      from:state.from,
      to:state.to,
      date:state.date,
      depart:f.depart,
      arrive:f.arrive,
      seat:state.seat,
      class:f.class,
      passenger:state.booking.name+' '+state.booking.family,
      price:f.price*state.pax
    };
    tickets.unshift(t);
    storage.set('as_tickets',JSON.stringify(tickets));
    state.lastTicket=t;
    state.booking={name:'',family:'',national:'',phone:''};
    state.seat=null;state.flight=null;
    state.tab='confirm';render();
  },
  showTicket:function(code){
    var t=tickets.find(function(x){return x.code===code;});
    if(t){state.lastTicket=t;state.tab='confirm';render();}
  },
  authMode:function(m){state.authMode=m;state.authStep='phone';render();},
  sendOTP:function(){
    if(state.authPhone.length<10){toast('شماره معتبر وارد کنید');return;}
    state.authStep='otp';render();
  },
  verifyOTP:function(){
    var phone=state.authPhone;
    var nm=state.authMode==='signup'?'کاربر جدید':(phone.slice(-4));
    user={name:'فوزیه رنجبر',phone:faDigit(phone),miles:1250,joined:Date.now()};
    storage.set('as_user',JSON.stringify(user));
    toast('خوش آمدید!');
    state.authStep='phone';
    state.tab='profile';render();
  },
  resetAuth:function(){state.authStep='phone';render();},
  logout:function(){
    if(confirm('از حساب خارج می‌شوید؟')){
      storage.del('as_user');user=null;
      state.tab='home';render();
    }
  },
  toastMsg:function(m){toast(m);}
};

// ---- Render ----
function render(){
  try{
    var html;
    switch(state.tab){
      case 'home':html=viewHome();break;
      case 'search':html=viewSearch();break;
      case 'results':html=viewResults();break;
      case 'booking':html=viewBooking();break;
      case 'confirm':html=viewConfirm();break;
      case 'tickets':html=viewTickets();break;
      case 'offers':html=viewOffers();break;
      case 'profile':html=viewProfile();break;
      case 'auth':html=viewAuth();break;
      default:html=viewHome();
    }
    $('#app').innerHTML=html;
    document.querySelectorAll('.tab').forEach(function(b){
      var active=b.dataset.tab===state.tab
        ||(state.tab==='auth'&&b.dataset.tab==='profile')
        ||(['results','booking','confirm'].indexOf(state.tab)>-1&&b.dataset.tab==='search');
      b.classList.toggle('active',active);
    });
    $('#app').scrollTop=0;
  }catch(e){
    $('#app').innerHTML='<div style="padding:40px;text-align:center;color:var(--err)"><h2>خطا</h2><p>'+(e.message||e)+'</p></div>';
  }
}

// ---- Init ----
document.querySelectorAll('.tab').forEach(function(b){
  b.addEventListener('click',function(){go(this.dataset.tab);});
});

// Update time
function updateTime(){
  var d=new Date();
  var h=d.getHours();
  var m=d.getMinutes();
  $('#sbTime').textContent=faDigit((h<10?'0':'')+h+':'+(m<10?'0':'')+m);
}
updateTime();setInterval(updateTime,30000);

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',render);}else{render();}

})();
