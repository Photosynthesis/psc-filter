<?php

class PSC_Filter {

	protected static $instance = null;

  var $options = array(
    'container' => null,
    'taxonomies' => null,
    'paginate' => null
  );


	private function __construct() {

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ), 0 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
    add_shortcode('psc-filter', array( $this, 'shortcode' ));

	}

	public static function get_instance() {

		if ( null == self::$instance ) {
			self::$instance = new self;
		}
		return self::$instance;
	}


	public function enqueue_styles(){
    wp_enqueue_style( 'psc-filter-style',plugins_url('/css/psc-filter.css', __FILE__) );
	}

	public function enqueue_scripts() {
  	wp_enqueue_media();
  	wp_register_script('psc-filter-js', plugins_url('/js/psc-filter.js', __FILE__), array('jquery'));
  	wp_enqueue_script('psc-filter-js');
	}


  public function shortcode($atts){

		$options = shortcode_atts($this->options, $atts,'psc-filter');
		return $this->filter_controls($options);

  }



  public function filter_controls($options){

    if($options['taxonomies'] && $options['container']){

      	$taxonomy_slugs = explode(',',$options['taxonomies']);

        $taxonomies = array();

        $all_taxonomies = get_taxonomies(array(),'objects');

        foreach ($all_taxonomies as $key=>$t) {
           if(in_array($t->name,$taxonomy_slugs)){
              $taxonomies[$t->name] = $t->labels->singular_name;
           }
        }

        if($options['upfx']){
          $upfx = $options['upfx'];
        }else{
          $upfx = substr(uniqid(),6,13);
        }


        $js = '
jQuery(document).ready(function($) {';
        $html = '<div class="psc-filters clearfix" id="'.$upfx.'-psc-filter">';

        foreach ($taxonomies as $tax_slug=>$tax_label) {

            $terms = get_terms(array('taxonomy'=>$tax_slug));

            $html .= '<div class="psc-filter-bar">
  <ul id="'.$tax_slug.'-filter" data-filter-taxonomy="'.$tax_slug.'"><li><div><span>'.$tax_label.'</span></div></li><li><a href="#" class="psc-filter-button active" data-filter-dimension="'.$tax_slug.'" data-filter-container="'.$options['container'].'" data-filter-value="all">All</a></li></ul>
</div>';
            $js .= 'var terms = {';

            $int = "";

            foreach ($terms as $key=>$term) {
            	$js .= $int."'".$term->slug."': '".addslashes(html_entity_decode($term->name,ENT_NOQUOTES))."'";
              $int = ",";
            }

            $js .= "}; \n";

            $js .= "pscFilterSettings.upfx = '".$upfx."';\n";

            $js .= 'pscBuildFilter(\''.$options['container'].'\',\''.$tax_slug.'-filter\',\''.$tax_slug.'\',terms);'."\n";

        }


        $html .= '
        </div>
        <div class="psc-filters-no-results" id="'.$upfx.'-psc-filter-no-results" style="display:none">No matching results found</div>
';

        if($options['paginate']){
          $html .=  '<div class="psc-paging-bar clearfix" id="psc-paging-bar-'.$upfx.'">
          <ul id="psc-paging-controls-ul-'.$upfx.'"></ul></div>';

          // Prepend the settings JS
          $paging_settings = "
    pscPagingSettings = {
      upfx: '$upfx',
      paginate: true,
      container: '".$options['container']."',
      rpp: '".$options['paginate']."'
    }";

          $js = $paging_settings.$js;
          $js .= "pscPaginate();\n";
        }

        $js .= "
    });";


        return '<script type="text/javascript">'.$js."</script>\n".$html;
    }

	}

}
