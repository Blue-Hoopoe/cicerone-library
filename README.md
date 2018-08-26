# cicerone-library

The word "cicerone" means more or less a "pilot". This library provides flexible tools, which allow to simply guide users on your websites by displaying personalized dialogs. Personally, I use it to present new features of my applications, but I truly believe, that it has a little bit more uses. If you want to know how it works in practise, please visit ```getting started``` folder.

## How presentation looks like
Let's asume, that your website has a new feature in the form of social share button. User can miss this important element of your page, unless you directly point it with your finger. Cicerone library creates half-transparent curtain on your site and step-by-step shows selected elements with your commentary in the form of previously created template.

## Library includes
Cicerone library consists of two files:
1. ```cicerone.css``` - provides all basic styles and visual logic of displaying dialogs,
2. ```cicerone.js``` - contains a definition of Cicerone object, which handles presentation logic and dialog customizations.

The packages contains also ```sass``` and ```less``` scaffolds as well as minified versions of above files.

## Initialize presentation
After including ```css``` and ```js``` files, create new instance of Cicerone object with array of objects that defines every step of your presentation:
```html
<script>
    var myPresentation = new Cicerone([
        {
            "selector": "#first-element-to-show",
            "template": "#dialog-template",
        }
    ]);
    myPresentation.start();
</script>
```
This is the smallest configuration of Cicerone available: it will show the element with ```id="first-element-to-show"``` and the dialog will contain html from ```<script>``` element with id ```dialog-template```. Mentioned template can be declared like this:
```html
<script type="text/template" id="dialog-template">
    <h1>Look at this feature!</h1>
</script>
```
## About the Cicerone object
Cicerone instance contains three public methods:
1. ```start(from = 1)``` - start method initialize the whole presentation. The ```from``` parameter defines from which step the presentation should be open (by default it is the first one).
2. ```makeStep(step)``` - makes next or previuos steps in the presentation depending on the step parameter. If index is out of range, automatically ends the presentation.
3. ```end()``` - ends the presentation and remove all elements with "cicerone" class.
 
There is also one property:
1. ```steps``` - contains all steps in the presentation. Can be used to remove or add new one.

## About the step object
As mentioned, the Cicerone constructor takes array of steps objects. Step objects must contains properties:
1. ```selector``` - css selector to the presented element,
2. ```template``` - css selector to the ```<script type="text/template">``` element, which holds the inner-dialog template.

Additionaly, it can also have:
- ```css``` - style string that will be add to presented element during it's step.
- ```placement``` - additional class that will be added to dialog. By deafult, library handles two values: ```left``` (default) and ```right```,
- ```variables``` - object of simple objects variables that will be inserted to the tamplate. It is handled like a associative array with ```'variable-name'=>'value'``` structure.

## About the dialog templates
As shown above, templates are stored in ```<script type="text/template">``` tag. It should contains html content, that is latter added to dialog body. 

What's important, Cicerone library handles simple variable inserting. The syntax can be known among others from ```Twig```, but it is limited to only simple objects like strings or numerics. Look at the example below:
```html
<script type="text/template" id="dialog-template">
    <h1>Hello {{ library }}</h1>
</script>

<script>
     new Cicerone([
        {
            "selector": "#first-element-to-show",
            "template": "#dialog-template",
            "variables": {
                "library": "Cicerone"
            }
        }
    ]);
</script>
```

There is also possibility to add navigation listeners to templates, which will be used to manipulate the presentation (e.g. "next" button). To add listener, include one of the tree attributes to the chosen element:
- ```cicerone-next``` - equivalent of makeStep(1) method, which shows next dialog,
- ```cicerone-back``` - equivalent of makeStep(-1) method, which shows previous dialog,
- ```cicerone-exit``` - equivalent of end() method, which ends the presentation.

## Complex example
Here is a little more composite example:
```html
<!-- creating dialog template -->
<script type="text/template" id="dialog-template">
    <div class="exit-button" cicerone-exit>X</div>
    <div class="body">
        <h1>{{ title }}</h1>
    </div>
    <div class="presentation-navigation">
        <span cicerone-back>Back</span>
        <span cicerone-next>Next</span>
    </div>
</script>

<!-- starting presentation -->
<script>
     new Cicerone([
        {
            "selector": "#first-element-to-show",
            "template": "#dialog-template",
            "variables": {
                "title": "This is the feature number 1!"
            }
        },
        {
            "selector": "#second-element-to-show",
            "template": "#dialog-template",
            "variables": {
                "title": "This is the feature number 2!"
            },
            "css": "background: yellow; color: red; padding: 10px;"
        },
    ]);
</script>
```
